"use client";

import { Table, Badge, Text, Center, Loader, Group } from "@mantine/core";
import { ProductWithRelations } from "../page";
import dayjs from "dayjs";

type ProductTableProps = {
  products: ProductWithRelations[];
  loading: boolean;
};

export function ProductTable({ products, loading }: ProductTableProps) {
  const rows = products.map((item) => {
    const isConsignment = !!item.partner;
    const profitMargin =
      item.salePrice > 0
        ? ((item.salePrice - item.costPrice) / item.salePrice) * 100
        : 0;

    return (
      <Table.Tr key={item.id}>
        <Table.Td>
          <Text fw={500}>{item.name}</Text>
          <Text size="xs" c="dimmed">
            {item.category || "Sem categoria"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge color={isConsignment ? "grape" : "blue"} variant="light">
            {isConsignment ? `Consignado (${item.partner?.companyName})` : "Estoque Próprio"}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text>R$ {item.salePrice.toFixed(2)}</Text>
        </Table.Td>
        <Table.Td>
          <Text c="dimmed">R$ {item.costPrice.toFixed(2)}</Text>
        </Table.Td>
        <Table.Td>
          <Text c={profitMargin > 0 ? "green" : "red"} fw={500}>
            {profitMargin.toFixed(1)}%
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">
            {item.inventoryItem?.name || "Não vinculado"}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th>Preço Venda (R$)</Table.Th>
            <Table.Th>Custo/Dívida (R$)</Table.Th>
            <Table.Th>Margem</Table.Th>
            <Table.Th>Item de Estoque</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Center h={200}>
                  <Loader color="privacyGold" />
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text ta="center" c="dimmed" py="lg">
                  Nenhum produto cadastrado.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
