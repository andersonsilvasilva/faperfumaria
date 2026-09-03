"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";

const NEWSLETTER_CONSENT_VERSION = "2026-09-v1";

const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
    confirmPassword: z.string(),
    terms: z.literal("on", { message: "É necessário aceitar os termos para criar sua conta." }),
    marketing: z.literal("on").optional(),
    callbackUrl: z.string().trim().optional().default(""),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export interface RegisterActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { status: "error", message: "Já existe uma conta com esse e-mail. Tente entrar." };
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    if (data.marketing === "on") {
      await tx.newsletterSubscriber.upsert({
        where: { email: data.email },
        update: {
          marketingOptIn: true,
          consentAt: new Date(),
          consentVersion: NEWSLETTER_CONSENT_VERSION,
        },
        create: {
          email: data.email,
          marketingOptIn: true,
          consentVersion: NEWSLETTER_CONSENT_VERSION,
          source: "cadastro",
        },
      });
    }
  });

  // Conta criada com sucesso — loga automaticamente, sem exigir que o cliente digite a senha
  // de novo (redirect embutido no signIn faz a navegação; erros aqui são bugs, não credenciais
  // erradas, já que acabamos de criar essa senha).
  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: data.callbackUrl || "/minha-conta",
  });

  return { status: "success" };
}
