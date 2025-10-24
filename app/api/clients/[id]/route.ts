import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@prisma/client";

type PatchParams = {
  params: { id: string };
};

/**
 * PATCH /api/clients/[id]
 * Updates a client's details (e.g., their crmData).
 */
export async function PATCH(req: NextRequest, { params }: PatchParams) {
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
    const { crmData } = body; // Only allowing CRM data updates for now

    if (!crmData || typeof crmData !== "object") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Dados de CRM inválidos" },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        crmData,
      },
    });

    return NextResponse.json<ApiResponse<Client>>(
      { success: true, data: updatedClient },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`PATCH /api/clients/${id} error:`, error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}
