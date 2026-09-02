"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const NEWSLETTER_CONSENT_VERSION = "2026-09-v1";

const subscribeSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  consent: z.literal("on", { message: "É necessário aceitar para se inscrever" }),
});

export interface NewsletterFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function subscribeToNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {
      marketingOptIn: true,
      consentAt: new Date(),
      consentVersion: NEWSLETTER_CONSENT_VERSION,
    },
    create: {
      email: parsed.data.email,
      marketingOptIn: true,
      consentVersion: NEWSLETTER_CONSENT_VERSION,
      source: "home-newsletter",
    },
  });

  return { status: "success", message: "Inscrição confirmada! Em breve você recebe novidades da FA." };
}
