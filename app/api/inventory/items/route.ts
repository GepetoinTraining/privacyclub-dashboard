import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { InventoryItem, SmallestUnit } from "@prisma/client"; // Added SmallestUnit

// Define a type for the serialized item including createdAt
type SerializedInventoryItem = Omit<InventoryItem, 'storageUnitSizeInSmallest' | 'reorderThresholdInSmallest'> & {
  storageUnitSizeInSmallest: number | null;
  reorderThresholdInSmallest: number | null;
  createdAt: Date; // Ensure createdAt is part of the type
};

/**
 * GET /api/inventory/items
 * Fetches all defined InventoryItem records.
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
    const items: InventoryItem[] = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
      // Select all fields including createdAt by default
    });

    // Convert Prisma Decimal fields to numbers
    const serializedItems: SerializedInventoryItem[] = items.map(item => ({
      ...item,
      // Keep createdAt as Date, JSON stringification/parsing will handle it
      storageUnitSizeInSmallest: item.storageUnitSizeInSmallest ? Number(item.storageUnitSizeInSmallest) : null,
      reorderThresholdInSmallest: item.reorderThresholdInSmallest ? Number(item.reorderThresholdInSmallest) : null,
    }));


    return NextResponse.json<ApiResponse<SerializedInventoryItem[]>>(
      // Return the correctly typed serialized items
      { success: true, data: serializedItems },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/inventory/items error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erro ao buscar itens de inventário" },
      { status: 500 }
    );
  }
}