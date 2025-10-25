import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse, ClientDetails } from "@/lib/types"; // Import ClientDetails
import { NextRequest, NextResponse } from "next/server";
import { Client, Prisma } from "@prisma/client"; // Import Prisma for Decimal

type GetParams = {
  params: { id: string };
};

/**
 * GET /api/clients/[id]
 * Fetches detailed information for a single client, including visits and sales.
 */
export async function GET(req: NextRequest, { params }: GetParams) {
  const session = await getSession();
  if (!session.staff?.isLoggedIn) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado" },
      { status: 401 }
    );
  }

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ID de cliente inválido" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        // Include visits...
        visits: {
          orderBy: { entryTime: 'desc' }, // Order visits, newest first
          // ...and within each visit, include sales...
          include: {
            sales: {
              orderBy: { createdAt: 'asc' }, // Order sales within a visit
              // ...and within each sale, include product and host
              include: {
                product: true,
                host: true, // Make sure host relation exists in Sale model
              },
            },
          },
        },
        _count: { // Also get the total visit count efficiently
          select: { visits: true }
        }
      },
    });

    if (!client) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Although the Prisma query matches ClientDetails structure,
    // explicit casting can sometimes help TypeScript.
    // We also need to handle potential Decimal to number/string conversion if necessary for the client,
    // but ClientDetails in lib/types.ts uses Decimal, so direct return should be okay.
    return NextResponse.json<ApiResponse<ClientDetails>>(
      // Cast the result to ClientDetails to satisfy the response type
      { success: true, data: client as unknown as ClientDetails },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`GET /api/clients/${id} error:`, error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao buscar detalhes do cliente" },
      { status: 500 }
    );
  }
}


/**
 * PATCH /api/clients/[id]
 * Updates a client's details (e.g., their crmData).
 */
export async function PATCH(req: NextRequest, { params }: GetParams) { // Changed PatchParams to GetParams reuse
  const session = await getSession();
  if (!session.staff?.isLoggedIn) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado" },
      { status: 401 }
    );
  }
  // TODO: Add role check

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ID de cliente inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    // Allow updating more fields if needed
    const { crmData, name, phoneNumber, status, acquiredByStaffId } = body;

    // Build update data object conditionally
    const updateData: Prisma.ClientUpdateInput = {};
    if (crmData && typeof crmData === 'object') updateData.crmData = crmData;
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (status !== undefined) updateData.status = status;
    if (acquiredByStaffId !== undefined) updateData.acquiredByStaffId = acquiredByStaffId === null ? null : parseInt(acquiredByStaffId);


    if (Object.keys(updateData).length === 0) {
       return NextResponse.json<ApiResponse>(
        { success: false, error: "Nenhum dado válido para atualizar" },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json<ApiResponse<Client>>(
      { success: true, data: updatedClient },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`PATCH /api/clients/${id} error:`, error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       // Handle unique constraint violation (e.g., phone number)
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Falha na restrição única: ${error.meta?.target}` },
          { status: 409 } // Conflict
        );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}
