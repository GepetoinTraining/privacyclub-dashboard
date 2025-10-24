"use client";

import { Button, Stack, Tabs, Title } from "@mantine/core";
import { PageHeader } from "../components/PageHeader";
import { Box, Package, Plus } from "lucide-react";
import { useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { ApiResponse, AggregatedStock } from "@/lib/types";
import { InventoryItem } from "@prisma/client";
import { CurrentStockTable } from "./components/CurrentStockTable";
import { CreateInventoryItemModal } from "./components/CreateInventoryItemModal";
import { InventoryItemTable } from "./components/InventoryItemTable";
import { AddStockModal } from "./components/AddStockModal";

function BarClientPage() {
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  const [stockLevels, setStockLevels] = useState<AggregatedStock[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [createItemModal, { open: openCreateItem, close: closeCreateItem }] =
    useDisclosure(false);
  const [addStockModal, { open: openAddStock, close: closeAddStock }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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
      const itemsRes = await fetch("/api/inventory/items"); // We already built this
      const itemsResult: ApiResponse<InventoryItem[]> = await itemsRes.json();
      if (itemsResult.success && itemsResult.data) {
        setInventoryItems(itemsResult.data);
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

  const handleOpenAddStock = (item: InventoryItem) => {
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
      {selectedItem && (
        <AddStockModal
          opened={addStockModal}
          onClose={closeAddStock}
          onSuccess={handleSuccess}
          item={selectedItem}
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
              onAddStock={(item) =>
                handleOpenAddStock(
                  inventoryItems.find((i) => i.id === item.inventoryItemId)!
                )
              }
            />
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            <InventoryItemTable
              items={inventoryItems}
              loading={loadingItems}
              onAddStock={handleOpenAddStock}
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
