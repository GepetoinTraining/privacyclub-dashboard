import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse, ReportData, ReportStat, SalesDataPoint, HostessLeaderboardItem, ProductLeaderboardItem } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

/**
 * GET /api/reports
 * Fetches all aggregated data for the BI dashboard.
 * ADMIN-only route.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.staff?.isLoggedIn || session.staff.pin !== "1234") {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const thirtyDaysAgo = dayjs().subtract(30, "days").toDate();

    // --- 1. Stats ---
    const salesLast30Days = await prisma.sale.aggregate({
      _sum: { priceAtSale: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const totalSales = await prisma.sale.aggregate({
      _sum: { priceAtSale: true },
    });

    const totalClients = await prisma.client.count();
    
    const avgSpend = (totalSales._sum.priceAtSale || 0) / (totalClients || 1);

    const stats: ReportStat[] = [
      {
        title: "Faturamento (Últimos 30d)",
        value: `R$ ${(salesLast30Days._sum.priceAtSale || 0).toFixed(2)}`,
        diff: 0, // Placeholder
      },
      {
        title: "Faturamento Total",
        value: `R$ ${(totalSales._sum.priceAtSale || 0).toFixed(2)}`,
        diff: 0,
      },
      {
        title: "Total de Clientes",
        value: totalClients.toString(),
        diff: 0,
      },
      {
        title: "Gasto Médio p/ Cliente",
        value: `R$ ${avgSpend.toFixed(2)}`,
        diff: 0,
      },
    ];

    // --- 2. Sales by Day (Chart) ---
    const salesByDayRaw = await prisma.sale.groupBy({
      by: ["createdAt"],
      _sum: {
        priceAtSale: true,
      },
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate by day (since raw data is by timestamp)
    const salesMap = new Map<string, number>();
    salesByDayRaw.forEach(sale => {
      const date = dayjs(sale.createdAt).format("DD/MM");
      const currentSales = salesMap.get(date) || 0;
      salesMap.set(date, currentSales + (sale._sum.priceAtSale || 0));
    });
    
    const salesByDay: SalesDataPoint[] = Array.from(salesMap.entries()).map(
      ([date, sales]) => ({ date, sales: parseFloat(sales.toFixed(2)) })
    );

    // --- 3. Top Hostesses ---
    const topHostessesRaw = await prisma.sale.groupBy({
      by: ["hostId"],
      _sum: {
        priceAtSale: true,
      },
      orderBy: {
        _sum: {
          priceAtSale: "desc",
        },
      },
      take: 5,
    });
    
    const hostesses = await prisma.host.findMany({
      where: { id: { in: topHostessesRaw.map(h => h.hostId) }}
    });
    
    const topHostesses: HostessLeaderboardItem[] = topHostessesRaw.map(h => {
      const host = hostesses.find(host => host.id === h.hostId);
      return {
        hostId: h.hostId,
        stageName: host?.stageName || 'Host Deletada',
        totalSales: h._sum.priceAtSale || 0
      }
    });

    // --- 4. Top Products ---
    const topProductsRaw = await prisma.sale.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });
    
    const products = await prisma.product.findMany({
      where: { id: { in: topProductsRaw.map(p => p.productId) }}
    });
    
    const topProducts: ProductLeaderboardItem[] = topProductsRaw.map(p => {
      const product = products.find(prod => prod.id === p.productId);
      return {
        productId: p.productId,
        name: product?.name || 'Produto Deletado',
        totalSold: p._sum.quantity || 0
      }
    });

    // --- Assemble Report Data ---
    const data: ReportData = {
      stats,
      salesByDay,
      topHostesses,
      topProducts,
    };

    return NextResponse.json<ApiResponse<ReportData>>(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao buscar dados do relatório" },
      { status: 500 }
    );
  }
}
