"use client";

import { Table, Tag, Badge, Text, Center, Loader } from "@mantine/core";
import { Staff, StaffRole } from "@prisma/client";
import dayjs from "dayjs";

type StaffTableProps = {
  staff: Staff[];
  loading: boolean;
};

export function StaffTable({ staff, loading }: StaffTableProps) {
  const getRoleColor = (role: StaffRole) => {
    switch (role) {
      case StaffRole.Cashier:
        return "green";
      case StaffRole.Security:
        return "blue";
      case StaffRole.Server:
        return "orange";
      case StaffRole.Bartender:
        return "grape";
      default:
        return "gray";
    }
  };

  const rows = staff.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text fw={500}>{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getRoleColor(item.defaultRole)} variant="light">
          {item.defaultRole}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={item.isActive ? "green" : "red"} variant="outline">
          {item.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {dayjs(item.createdAt).format("DD/MM/YYYY")}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table verticalSpacing="sm" striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nome</Table.Th>
            <Table.Th>Cargo</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Data de Início</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Center h={200}>
                  <Loader color="privacyGold" />
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text ta="center" c="dimmed" py="lg">
                  Nenhum funcionário encontrado.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
