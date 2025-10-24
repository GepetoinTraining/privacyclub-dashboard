"use client";

import { Stack, LoadingOverlay, Alert } from "@mantine/core";
import { PageHeader } from "../components/PageHeader";
import { useState, useEffect } from "react";
import { ApiResponse, LiveData } from "@/lib/types";
import { notifications } from "@mantine/notifications";
import { LiveMap } from "../components/LiveMap";
import { AlertCircle } from "lucide-react";

export default function LivePage() {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);

  // We need to fetch ALL live data for the map, not just from /api/live
  // We also need environment layouts, live interactions, etc.
  // For now, we'll use the /api/live data as a starting point.
  // In a real app, this would be a WebSocket or frequent poller.

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/live"); // Uses the POS data source for now
      if (!response.ok) throw new Error("Failed to fetch live data");
      const result: ApiResponse<LiveData> = await response.json();
      if (result.success && result.data) {
        setLiveData(result.data);
      } else {
        throw new Error(result.error || "Could not load live data");
      }
    } catch (error: any) {
      console.error(error);
      notifications.show({
        title: "Erro ao carregar mapa",
        message: error.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    // Set up a poller to refresh data every 10 seconds
    const interval = setInterval(fetchLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Stack>
      <PageHeader title="Live Map" />
      <Alert
        variant="light"
        color="blue"
        title="Atualização em Tempo Real"
        icon={<AlertCircle />}
      >
        Este mapa atualiza a cada 10 segundos com os clientes e hostesses
        disponíveis.
      </Alert>
      <LoadingOverlay visible={loading} />
      {liveData && (
        <LiveMap
          clients={liveData.clients}
          hostesses={liveData.hostesses}
        />
      )}
    </Stack>
  );
}

