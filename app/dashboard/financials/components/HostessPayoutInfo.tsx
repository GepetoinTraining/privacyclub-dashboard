"use client";

import { HostessPayout } from "@/lib/types";
import { Table, Paper, Title, Text } from "@mantine/core";

interface HostessPayoutInfoProps {
  payouts: HostessPayout[];
}

export default function HostessPayoutInfo({ payouts }: HostessPayoutInfoProps) {
  const rows = payouts.map((item) => (
    <Table.Tr key={item.hostId}>
      <Table.Td>{item.stageName}</Table.Td>
      <Table.Td>
        {item.totalCommission.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper shadow="md" p="md" withBorder radius="md" mt="md" bg="dark.8">
      <Title order={4} c="white" mb="md">
        Comissões de Hostess (A Pagar)
      </Title>
      <Text c="dimmed" size="sm" mb="md">
        Soma de todas as comissões não pagas de plantões encerrados. (Funcionalidade de pagamento em breve).
      </Text>
      <Table.ScrollContainer minWidth={300}>
        <Table verticalSpacing="sm" striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Hostess</Table.Th>
              <Table.Th>Total Devido</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : (
            <Table.Tr>
              <Table.Td colSpan={2} c="dimmed" align="center">
                Nenhuma comissão a pagar.
              </Table.Td>
            </Table.Tr>
          )}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

