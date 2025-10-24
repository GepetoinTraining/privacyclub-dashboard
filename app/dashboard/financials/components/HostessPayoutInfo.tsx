"use client";

import { Table, Text, Alert, Stack } from "@mantine/core";
import { HostessCommissionSummary } from "@/lib/types";
import { Info } from "lucide-react";

type HostessPayoutInfoProps = {
  commissions: HostessCommissionSummary[];
};

export function HostessPayoutInfo({ commissions }: HostessPayoutInfoProps) {
  const rows = commissions.map((item) => (
    <Table.Tr key={item.hostId}>
      <Table.Td>{item.stageName}</Table.Td>
      <Table.Td>
        <Text fw={700}>R$ {item.totalUnpaidCommissions.toFixed(2)}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Alert color="blue" icon={<Info size={16} />} title="Aviso Importante">
        Esta é uma prévia do total de comissões de hostess não pagas,
        calculadas a partir de todas as vendas. Para um sistema de folha de
        pagamento completo, é necessário implementar uma ação de "Fechar Turno"
        para criar um registro de pagamento.
      </Alert>
      <Table.ScrollContainer minWidth={400}>
        <Table verticalSpacing="sm" striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Hostess</Table.Th>
              <Table.Th>Total a Pagar (R$)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text ta="center" c="dimmed" py="lg">
                    Nenhuma comissão de hostess pendente.
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table.ScrollContainer>
    </Stack>
  );
}
