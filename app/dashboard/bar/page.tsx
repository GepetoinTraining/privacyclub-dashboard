"use client";

import { Button, Stack, Tabs, Title } from "@mantine/core";
import { PageHeader } from "../components/PageHeader";
import { Box, Package, Plus } from "lucide-react";
import { useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { ApiResponse, AggregatedStock } from "@/lib/types";
// Import InventoryItem type from Prisma for casting if needed later
import { InventoryItem, SmallestUnit } from "@prisma/client"; // Added SmallestUnit
import { CurrentStockTable } from "./components/CurrentStockTable";
import { CreateInventoryItemModal } from "./components/CreateInventoryItemModal";
import { InventoryItemTable } from "./components/InventoryItemTable";
import { AddStockModal } from "./components/AddStockModal";

// Define the type expected from the API after serialization
// Make sure this matches the type defined in the API route
type SerializedInventoryItem = Omit<InventoryItem, 'storageUnitSizeInSmallest' | 'reorderThresholdInSmallest'> & {
  storageUnitSizeInSmallest: number | null;
  reorderThresholdInSmallest: number | null;
  createdAt: Date | string; // Expect Date object OR string from JSON parse
};


function BarClientPage() {
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  const [stockLevels, setStockLevels] = useState<AggregatedStock[]>([]);
  // Use the SerializedInventoryItem type for state
  const [inventoryItems, setInventoryItems] = useState<SerializedInventoryItem[]>([]);

  const [createItemModal, { open: openCreateItem, close: closeCreateItem }] =
    useDisclosure(false);
  const [addStockModal, { open: openAddStock, close: closeAddStock }] =
    useDisclosure(false);
  // selectedItem should also use the serialized type
  const [selectedItem, setSelectedItem] = useState<SerializedInventoryItem | null>(null);

  const fetchData = async () => {
    setLoadingStock(true);
    setLoadingItems(true);
    try {
      // Fetch aggregated stock levels
      const stockRes = await fetch("/api/inventory?aggregate=true");
      const stockResult: ApiResponse<AggregatedStock[]> = await stockRes.json();
      if (stockResult.success && stockResult.data) {
        setStockLevels(stockResult.data);
      }

      // Fetch all defined inventory items
      const itemsRes = await fetch("/api/inventory/items");
      // Expect the serialized type from the API
      const itemsResult: ApiResponse<SerializedInventoryItem[]> = await itemsRes.json();
      if (itemsResult.success && itemsResult.data) {
        // IMPORTANT: Convert Date strings from JSON back to Date objects
        const itemsWithDates = itemsResult.data.map(item => ({
          ...item,
          // Ensure createdAt is a Date object for components like dayjs
          createdAt: new Date(item.createdAt)
        }));
        setInventoryItems(itemsWithDates);
      }
    } catch (error) {
      console.error(error);
      // TODO: Show notification
    } finally {
      setLoadingStock(false);
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Adjust the type for the item passed to the modal handler
  const handleOpenAddStock = (item: SerializedInventoryItem) => {
    setSelectedItem(item);
    openAddStock();
  };

  const handleSuccess = () => {
    closeCreateItem();
    closeAddStock();
    fetchData(); // Refresh all data
  };

  return (
    <>
      <CreateInventoryItemModal
        opened={createItemModal}
        onClose={closeCreateItem}
        onSuccess={handleSuccess}
      />
      {/* Pass the correctly typed selectedItem */}
      {selectedItem && (
        <AddStockModal
          opened={addStockModal}
          onClose={closeAddStock}
          onSuccess={handleSuccess}
          // Note: AddStockModal might need internal adjustments
          // if it performs math with Decimal fields directly.
          // For now, cast necessary props if it expects InventoryItem
          item={selectedItem as InventoryItem} // Casting might be okay if AddStockModal only READS basic fields
        />
      )}

      <Stack>
        <PageHeader
          title="Bar / Inventário"
          actionButton={
            <Button
              leftSection={<Plus size={16} />}
              onClick={openCreateItem}
              color="privacyGold"
            >
              Definir Novo Item
            </Button>
          }
        />

        <Tabs defaultValue="stock">
          <Tabs.List>
            <Tabs.Tab value="stock" leftSection={<Box size={16} />}>
              Estoque Atual
            </Tabs.Tab>
            <Tabs.Tab value="items" leftSection={<Package size={16} />}>
              Itens Definidos
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="stock" pt="md">
            <CurrentStockTable
              stockLevels={stockLevels}
              loading={loadingStock}
              onAddStock={(stockItem) => {
                 // Find the corresponding full item detail from state
                 const fullItem = inventoryItems.find((i) => i.id === stockItem.inventoryItemId);
                 if (fullItem) {
                   handleOpenAddStock(fullItem);
                 }
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            {/* Pass the state which is now SerializedInventoryItem[] */}
            <InventoryItemTable
              items={inventoryItems}
              loading={loadingItems}
              onAddStock={handleOpenAddStock} // Pass the handler expecting SerializedInventoryItem
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}

export default function BarPage() {
  return <BarClientPage />;
}