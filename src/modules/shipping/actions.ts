"use server";

import { getShippingOptions, type ShippingOption } from "@/modules/shipping/provider";

export interface ShippingCalcState {
  status: "idle" | "success" | "error";
  options?: ShippingOption[];
  message?: string;
}

export async function calculateShippingAction(
  _prevState: ShippingCalcState,
  formData: FormData,
): Promise<ShippingCalcState> {
  const cep = formData.get("cep")?.toString() ?? "";
  if (cep.replace(/\D/g, "").length !== 8) {
    return { status: "error", message: "Informe um CEP válido (8 dígitos)." };
  }

  const options = await getShippingOptions(cep);
  return { status: "success", options };
}
