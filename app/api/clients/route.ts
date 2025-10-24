import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@prisma/client";

/**
 * GET /api/clients
 * Fetches all clients for the main client list.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.staff?.isLoggedIn) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json<ApiResponse<Client[]>>(
      { success: true, data: clients },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Creates a new client.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.staff?.isLoggedIn) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, phoneNumber, status, acquiredByStaffId, crmData } = body;

    if (!name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        phoneNumber,
        status,
        crmData,
        acquiredByStaffId: acquiredByStaffId
          ? parseInt(acquiredByStaffId)
          : null,
      },
    });

    return NextResponse.json<ApiResponse<Client>>(
      { success: true, data: newClient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/clients error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}

