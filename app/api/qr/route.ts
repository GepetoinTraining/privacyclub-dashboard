import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse, QrTokenPayload } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { generateQrCodeDataUrl, signClientToken } from "@/lib/qr";

/**
 * POST /api/qr
 * Creates a new Client (anonymous) and a new Visit, then
 * returns a JWT and a QR code for them.
 *
 * This is called by the Cashier.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.staff?.isLoggedIn) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado" },
      { status: 401 }
    );
  }
  // TODO: Add role check for Cashier

  try {
    const { entryFee, consumableCredit } = await req.json();

    // 1. Create a new, anonymous client
    const newClient = await prisma.client.create({
      data: {
        name: "Patrono", // Default anonymous name
        status: "new",
        // Other fields will be null or default
      },
    });

    // 2. Create the new visit for this client
    const newVisit = await prisma.visit.create({
      data: {
        clientId: newClient.id,
        entryFeePaid: parseFloat(entryFee) || 200.00,
        consumableCreditTotal: parseFloat(consumableCredit) || 100.00,
        consumableCreditRemaining: parseFloat(consumableCredit) || 100.00,
        // We'll set currentEnvironmentId when they move to a table
      },
    });

    // 3. Create the secure token
    const tokenPayload = {
      visitId: newVisit.id,
      clientId: newClient.id,
    };
    const token = signClientToken(tokenPayload);

    // 4. Generate the URL and QR code
    const clientUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/v/${token}`;
    const qrCodeUrl = await generateQrCodeDataUrl(clientUrl);

    const responsePayload: QrTokenPayload = {
      token,
      qrCodeUrl,
    };

    return NextResponse.json<ApiResponse<QrTokenPayload>>(
      { success: true, data: responsePayload },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/qr error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao gerar QR code" },
      { status: 500 }
    );
  }
}
