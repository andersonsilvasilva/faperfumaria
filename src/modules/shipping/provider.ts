import "server-only";
import { prisma } from "@/lib/prisma";

export type ShippingMethod = "LOCAL_PICKUP" | "LOCAL_DELIVERY" | "NATIONAL";

export interface ShippingOption {
  method: ShippingMethod;
  label: string;
  cost: number;
  estimatedDays?: number;
}

interface ViaCepResponse {
  cep?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const DEFAULT_LOCAL_DELIVERY_PRICING: Record<string, number> = {
  Bombinhas: 15,
  "Porto Belo": 20,
  Itapema: 25,
};

const LOCAL_DELIVERY_SETTING_KEY = "local_delivery_pricing";

async function getLocalDeliveryPricing(): Promise<Record<string, number>> {
  const setting = await prisma.storeSetting.findUnique({ where: { key: LOCAL_DELIVERY_SETTING_KEY } });
  if (setting && typeof setting.value === "object" && setting.value !== null) {
    return setting.value as Record<string, number>;
  }
  return DEFAULT_LOCAL_DELIVERY_PRICING;
}

async function lookupCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data: ViaCepResponse = await response.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Frete nacional: cálculo MOCK enquanto não há integração real com transportadora (Fase 6).
 * Nunca usar este valor como cotação real — apenas estimativa para desenvolvimento/demonstração.
 */
function estimateNationalShipping(cartWeightGrams: number): { cost: number; estimatedDays: number } {
  const base = 24.9;
  const perKg = 6.5;
  const weightKg = Math.max(0.3, cartWeightGrams / 1000);
  const cost = Math.round((base + perKg * weightKg) * 100) / 100;
  return { cost, estimatedDays: 7 };
}

export async function getShippingOptions(cep: string | undefined, cartWeightGrams = 300): Promise<ShippingOption[]> {
  const options: ShippingOption[] = [
    {
      method: "LOCAL_PICKUP",
      label: "Retirar na loja — R. Maracujá, 72, Sertãozinho, Bombinhas/SC",
      cost: 0,
    },
  ];

  const cepInfo = cep ? await lookupCep(cep) : null;
  const pricing = await getLocalDeliveryPricing();

  if (cepInfo?.uf === "SC" && cepInfo.localidade && pricing[cepInfo.localidade] != null) {
    options.push({
      method: "LOCAL_DELIVERY",
      label: `Entrega local em ${cepInfo.localidade}`,
      cost: pricing[cepInfo.localidade],
      estimatedDays: 2,
    });
  }

  const national = estimateNationalShipping(cartWeightGrams);
  options.push({
    method: "NATIONAL",
    label: "Frete nacional (Correios/transportadora)",
    cost: national.cost,
    estimatedDays: national.estimatedDays,
  });

  return options;
}
