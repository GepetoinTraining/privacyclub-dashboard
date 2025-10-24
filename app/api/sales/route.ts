import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse, SalePayload } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Sale, StaffRole } from "@prisma/client";

/**
 * POST /api/sales
 * Creates a new sale, updates client credit, calculates commission.
 * This is the main transaction engine.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (
    !session.staff?.isLoggedIn ||
    !session.staff.shiftId ||
    !session.staff.role
  ) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado. Faça check-in." },
      { status: 401 }
    );
  }

  // Only Servers, Bartenders, or Admins (implied) can make sales
  if (
    ![StaffRole.Server, StaffRole.Bartender].includes(session.staff.role) &&
    session.staff.pin !== "1234" // Allow admin override
  ) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Função não autorizada para vendas" },
      { status: 403 }
    );
  }

  const staffShiftId = session.staff.shiftId;
  const staffId = session.staff.id;

  try {
    const body: SalePayload = await req.json();
    const { visitId, hostId, cart } = body;

    if (!visitId || !hostId || !cart || cart.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dados da venda inválidos" },
        { status: 400 }
      );
    }

    // --- 1. Get all required data in one go ---
    const [visit, host, products] = await Promise.all([
      prisma.visit.findUnique({ where: { id: visitId } }),
      prisma.host.findUnique({ where: { id: hostId } }),
      prisma.product.findMany({
        where: { id: { in: cart.map((item) => item.productId) } },
      }),
    ]);

    if (!visit)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Visita não encontrada" },
        { status: 404 }
      );
    if (!host)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Hostess não encontrada" },
        { status: 404 }
      );

    // --- 2. Calculate totals and commissions ---
    let totalSaleAmount = 0;
    let totalCommission = 0;
    const saleItemsData: Prisma.SaleCreateManyInput[] = [];

    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new Error(`Produto ID ${item.productId} não encontrado`);

      const priceAtSale = product.salePrice;
      const itemTotal = priceAtSale * item.quantity;
      const itemCommission = itemTotal * host.commissionRate;

      totalSaleAmount += itemTotal;
      totalCommission += itemCommission;

      // Prepare sale data (will be bulk-created inside transaction)
      saleItemsData.push({
        visitId: visit.id,
        hostId: host.id,
        productId: product.id,
        staffShiftId: staffShiftId,
        quantity: item.quantity,
        priceAtSale: priceAtSale,
        commissionEarned: itemCommission,
        // Payment split will be set after credit calculation
      });
    }

    // --- 3. Calculate payment split ---
    const creditToUse = Math.min(
      visit.consumableCreditRemaining,
      totalSaleAmount
    );
    const cashToCharge = totalSaleAmount - creditToUse;
    const newCreditRemaining = visit.consumableCreditRemaining - creditToUse;

    // Apply payment split to all sale items
    // (We just log the total split on the *first* item for simplicity,
    // or you could prorate it, but this is simpler for reporting)
    saleItemsData.forEach((item, index) => {
      if (index === 0) {
        item.paidWithCredit = creditToUse;
        item.paidWithCashCard = cashToCharge;
      } else {
        item.paidWithCredit = 0;
        item.paidWithCashCard = 0;
      }
    });

    // --- 4. Create Transaction ---
    const [_, updatedVisit] = await prisma.$transaction([
      // 1. Create all Sale records
      prisma.sale.createMany({
        data: saleItemsData,
      }),
      
      // 2. Update Visit credit
      prisma.visit.update({
        where: { id: visit.id },
        data: {
          consumableCreditRemaining: newCreditRemaining,
        },
      }),

      // 3. Update Client lifetime stats
      prisma.client.update({
        where: { id: visit.clientId! }, // We know this exists from the visit
        data: {
          lifetimeSpend: { increment: totalSaleAmount },
          lastVisitSpend: { increment: totalSaleAmount }, // This assumes one visit at a time
          lastVisitDate: new Date(),
        },
      }),

      // 4. Log Staff commission for the sale (e.g., 2% of total)
      prisma.staffCommission.create({
        data: {
          staffId: staffId,
          commissionType: "sale",
          amountEarned: totalSaleAmount * 0.02, // 2% hardcoded, make this dynamic later
          relatedSaleId: undefined, // Can't link to a createMany,
          notes: `Comissão de 2% sobre venda de R$ ${totalSaleAmount.toFixed(2)}`,
        }
      })
    ]);

    // Triggers for StockLedger and PartnerPayout will run automatically

    return NextResponse.json<ApiResponse>(
      { success: true, data: { newCredit: updatedVisit.consumableCreditRemaining } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/sales error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao processar venda: " + error.message },
      { status: 500 }
    );
  }
}
