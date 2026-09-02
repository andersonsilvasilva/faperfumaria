"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface AddressActionState {
  status: "idle" | "error";
  message?: string;
}

const addressSchema = z.object({
  label: z.string().trim().min(1, "Informe um nome para este endereço (ex.: Casa, Trabalho)."),
  recipientName: z.string().trim().min(3, "Informe o nome de quem recebe."),
  phone: z.string().trim().min(8, "Telefone inválido."),
  zipCode: z.string().trim().min(8, "CEP inválido."),
  street: z.string().trim().min(1, "Informe o endereço."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().trim().optional().default(""),
  neighborhood: z.string().trim().min(1, "Informe o bairro."),
  city: z.string().trim().min(1, "Informe a cidade."),
  state: z.string().trim().min(2, "Informe o estado (UF)."),
  isDefault: z.literal("on").optional(),
});

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user.id;
}

export async function createAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const userId = await requireUserId();
  const { isDefault, ...data } = parsed.data;

  if (isDefault === "on") {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  await prisma.address.create({
    data: { ...data, userId, country: "BR", isDefault: isDefault === "on" },
  });

  revalidatePath("/minha-conta/enderecos");
  redirect("/minha-conta/enderecos");
}

export async function updateAddressAction(
  addressId: string,
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const userId = await requireUserId();
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    return { status: "error", message: "Endereço não encontrado." };
  }

  const { isDefault, ...data } = parsed.data;

  if (isDefault === "on") {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  await prisma.address.update({
    where: { id: addressId },
    data: { ...data, isDefault: isDefault === "on" },
  });

  revalidatePath("/minha-conta/enderecos");
  redirect("/minha-conta/enderecos");
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const addressId = formData.get("addressId")?.toString();
  if (!addressId) return;

  const userId = await requireUserId();
  await prisma.address.deleteMany({ where: { id: addressId, userId } });
  revalidatePath("/minha-conta/enderecos");
}

export async function setDefaultAddressAction(formData: FormData): Promise<void> {
  const addressId = formData.get("addressId")?.toString();
  if (!addressId) return;

  const userId = await requireUserId();
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) return;

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/minha-conta/enderecos");
}
