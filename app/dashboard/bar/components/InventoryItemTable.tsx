"use client";

import {
  Table,
  Text,
  Center,
  Loader,
  ActionIcon,
} from "@mantine/core";
// Import InventoryItem just for the Omit base type
import { InventoryItem, SmallestUnit } from "@prisma/client";
import dayjs from "dayjs";
import { Plus } from "lucide-react";

// Define the type expected by this component (matching the Page component's state)
type SerializedInventoryItem = Omit<InventoryItem, 'storageUnitSizeInSmallest' | 'reorderThresholdInSmallest'> & {
  storageUnitSizeInSmallest: number | null;
  reorderThresholdInSmallest: number | null;
  createdAt: Date; // Expecting Date object after page component conversion
};


type InventoryItemTableProps = {
  // Update prop type to expect the serialized version
  items: SerializedInventoryItem[];
  loading: boolean;
  // Adjust onAddStock to accept the serialized type
  onAddStock: (item: SerializedInventoryItem) => void;
};


export function InventoryItemTable({
  items,
  loading,
  onAddStock,
}: InventoryItemTableProps) {
  // Item type here correctly infers SerializedInventoryItem from props
  const rows = items.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text fw={500}>{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text>
          {/* storageUnitSizeInSmallest is now number | null */}
          {item.storageUnitName} ({item.storageUnitSizeInSmallest?.toString() || 'N/A'}{" "}
          {item.smallestUnit})
        </Text>
      </Table.Td>
      <Table.Td>
        <Text c="dimmed">
           {/* reorderThresholdInSmallest is now number | null */}
          {item.reorderThresholdInSmallest?.toString() || "N/A"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {/* createdAt is now expected as Date, check just in case */}
          {item.createdAt ? dayjs(item.createdAt).format("DD/MM/YYYY") : "N/A"}
        </Text>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          variant="light"
          color="blue"
          onClick={() => onAddStock(item)} // Pass the correctly typed item
          title="Adicionar estoque (compra)"
        >
          <Plus size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nome do Item</Table.Th>
            <Table.Th>Unidade de Armazenagem</Table.Th>
            <Table.Th>Nível de Alerta</Table.Th>
            <Table.Th>Criado em</Table.Th>
            <Table.Th>Adicionar</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Center h={200}>
                  <Loader color="privacyGold" />
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text ta="center" c="dimmed" py="lg">
                  Nenhum item de inventário definido.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}