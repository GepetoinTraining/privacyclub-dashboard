"use client";

import {
  Modal,
  TextInput,
  Select,
  Button,
  Stack,
  LoadingOverlay,
  NumberInput,
  SegmentedControl,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { InventoryItem, Partner, Product } from "@prisma/client";
import { useState, useEffect } from "react";
import { ApiResponse } from "@/lib/types";
import { notifications } from "@mantine/notifications";

type CreateProductModalProps = {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type SelectData = { label: string; value: string };

export function CreateProductModal({
  opened,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState<"own" | "consignment">("own");

  // Data for dropdowns
  const [inventoryItems, setInventoryItems] = useState<SelectData[]>([]);
  const [partners, setPartners] = useState<SelectData[]>([]);

  const form = useForm({
    initialValues: {
      name: "",
      category: "",
      costPrice: 0,
      salePrice: 0,
      inventoryItemId: null as string | null,
      deductionAmount: 1,
      partnerId: null as string | null,
    },
    validate: {
      name: (val) => (val.trim().length < 2 ? "Nome inválido" : null),
      salePrice: (val) => (val <= 0 ? "Preço de venda deve ser positivo" : null),
      costPrice: (val) => (val < 0 ? "Custo não pode ser negativo" : null),
      inventoryItemId: (val, values) =>
        !val ? "Item de estoque é obrigatório" : null,
      partnerId: (val, values) =>
        productType === "consignment" && !val
          ? "Parceiro é obrigatório"
          : null,
    },
  });

  // Fetch data for dropdowns when modal opens
  useEffect(() => {
    if (opened) {
      // Fetch inventory items
      fetch("/api/inventory/items")
        .then((res) => res.json())
        .then((result: ApiResponse<InventoryItem[]>) => {
          if (result.success && result.data) {
            setInventoryItems(
              result.data.map((item) => ({
                label: `${item.name} (${item.storageUnitName})`,
                value: item.id.toString(),
              }))
            );
          }
        });

      // Fetch partners
      fetch("/api/partners")
        .then((res) => res.json())
        .then((result: ApiResponse<Partner[]>) => {
          if (result.success && result.data) {
            setPartners(
              result.data.map((partner) => ({
                label: partner.companyName,
                value: partner.id.toString(),
              }))
            );
          }
        });
    } else {
      // Reset form when modal closes
      form.reset();
      setProductType("own");
    }
  }, [opened]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const payload = {
      ...values,
      partnerId: productType === "own" ? null : values.partnerId,
      // For consignment, costPrice is what we *owe* them.
      // For own stock, costPrice is what *we* paid.
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<Product> = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha ao criar produto");

      notifications.show({
        title: "Sucesso!",
        message: `Produto "${values.name}" criado.`,
        color: "green",
      });
      onSuccess();
    } catch (error: any) {
      notifications.show({
        title: "Erro",
        message: error.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Adicionar Novo Produto (Menu)"
      centered
      size="lg"
    >
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SegmentedControl
            fullWidth
            color="privacyGold"
            value={productType}
            onChange={(val: "own" | "consignment") => setProductType(val)}
            data={[
              { label: "Estoque Próprio", value: "own" },
              { label: "Consignado (Parceiro)", value: "consignment" },
            ]}
          />

          <TextInput
            required
            label="Nome do Produto"
            placeholder="Ex: Dose JW Black"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Categoria"
            placeholder="Ex: Whisky, Vodka, Cigarro"
            {...form.getInputProps("category")}
          />
          <NumberInput
            required
            label="Preço de Venda (R$)"
            placeholder="Preço no menu para o cliente"
            min={0}
            decimalScale={2}
            fixedDecimalScale
            {...form.getInputProps("salePrice")}
          />

          {productType === "consignment" && (
            <Paper p="md" withBorder>
              <Stack>
                <Title order={5}>Detalhes da Consignação</Title>
                <Select
                  required
                  label="Parceiro (Dono do produto)"
                  placeholder="Selecione o parceiro"
                  data={partners}
                  searchable
                  {...form.getInputProps("partnerId")}
                />
                <NumberInput
                  required
                  label="Valor Devido ao Parceiro (R$)"
                  description="Quanto o clube deve ao parceiro por esta venda."
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  {...form.getInputProps("costPrice")}
                />
              </Stack>
            </Paper>
          )}

          {productType === "own" && (
             <Paper p="md" withBorder>
                <Title order={5}>Detalhes do Estoque Próprio</Title>
                 <NumberInput
                  required
                  label="Custo do Produto (R$)"
                  description="Quanto o clube pagou por este item (para cálculo de lucro)."
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  {...form.getInputProps("costPrice")}
                />
             </Paper>
          )}

          <Paper p="md" withBorder mt="md">
            <Title order={5}>Vínculo de Estoque</Title>
            <Select
              required
              label="Item de Estoque Físico"
              description="Qual item físico será deduzido quando este produto for vendido?"
              placeholder="Selecione o item do inventário"
              data={inventoryItems}
              searchable
              {...form.getInputProps("inventoryItemId")}
            />
            <NumberInput
              required
              label="Quantidade a Deduzir"
              description="Ex: '50' para 50ml, '1' para 1 unidade/garrafa"
              min={0}
              {...form.getInputProps("deductionAmount")}
            />
          </Paper>

          <Button type="submit" mt="md" color="privacyGold" loading={loading}>
            Salvar Produto
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
