"use client";

import { Text, Stack, LoadingOverlay, Alert, Tabs } from "@mantine/core";
import { PageHeader } from "../components/PageHeader";
import { useState, useEffect } from "react";
import { ApiResponse, FinancialsData } from "@/lib/types";
import { notifications } from "@mantine/notifications";
import { Building, CircleDollarSign, Heart, User } from "lucide-react";
import { StaffPayoutTable } from "./components/StaffPayoutTable";
import { PartnerPayoutTable } from "./components/PartnerPayoutTable";
import { HostessPayoutInfo } from "./components/HostessPayoutInfo";

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/financials");
      if (!response.ok) throw new Error("Failed to fetch financial data");
      const result: ApiResponse<FinancialsData> = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || "Could not load financial data");
      }
    } catch (error: any) {
      console.error(error);
      notifications.show({
        title: "Erro ao carregar dados",
        message: error.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Stack>
      <PageHeader title="Financeiro (Contas a Pagar)" />
      <LoadingOverlay visible={loading} />

      <Tabs defaultValue="staff" color="privacyGold">
        <Tabs.List>
          <Tabs.Tab value="staff" leftSection={<User size={16} />}>
            Staff
          </Tabs.Tab>
          <Tabs.Tab value="partners" leftSection={<Building size={16} />}>
            Parceiros
          </Tabs.Tab>
          <Tabs.Tab value="hostesses" leftSection={<Heart size={16} />}>
            Hostesses
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="staff" pt="md">
          <StaffPayoutTable
            commissions={data?.staffCommissions || []}
            onSuccess={fetchData}
          />
        </Tabs.Panel>

        <Tabs.Panel value="partners" pt="md">
          <PartnerPayoutTable
            payouts={data?.partnerPayouts || []}
            onSuccess={fetchData}
          />
        </Tabs.Panel>
        
        <Tabs.Panel value="hostesses" pt="md">
          <HostessPayoutInfo 
            commissions={data?.hostessCommissions || []}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

