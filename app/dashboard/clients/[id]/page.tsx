"use client";

import { Container, Title, Paper, Text, Loader, Center } from "@mantine/core";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDetail } from "./components/ClientDetail";
import { ClientVisitHistory } from "./components/ClientVisitHistory";
import { ClientWithVisits } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

async function getClientData(
  id: number
): Promise<ClientWithVisits | null> {
  try {
    const response = await fetch(`/api/clients/${id}`);
    if (!response.ok) {
      return null;
    }
    const result: ApiResponse<ClientWithVisits> = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch client data:", error);
    return null;
  }
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [client, setClient] = useState<ClientWithVisits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(id)) {
      setLoading(false);
      return;
    }

    getClientData(id)
      .then((data) => {
        setClient(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="privacyGold" />
      </Center>
    );
  }

  if (!client) {
    return (
      <Container fluid>
        <Title order={2} mb="lg">
          Cliente não encontrado
        </Title>
        <Paper withBorder shadow="md" p="lg">
          <Text>
            O cliente com o ID {id} não foi encontrado no sistema.
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Perfil do Cliente: {client.name}
      </Title>
      <ClientDetail client={client} />
      <ClientVisitHistory visits={client.visits} />
    </Container>
  );
}

