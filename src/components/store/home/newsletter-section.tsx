"use client";

import { useActionState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletter, type NewsletterFormState } from "@/modules/newsletter/actions";

const initialState: NewsletterFormState = { status: "idle" };

export function NewsletterSection() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section className="border-t border-fa-stone/15 bg-fa-off-white py-16">
      <Container className="max-w-xl text-center">
        <h2 className="font-display text-3xl text-fa-black">Entre para o universo FA</h2>
        <p className="mt-3 text-fa-black/70">
          Receba novidades, lançamentos, seleções especiais e condições exclusivas diretamente no
          seu e-mail.
        </p>

        <form action={formAction} className="mt-8 space-y-4 text-left">
          <div>
            <label htmlFor="newsletter-email" className="sr-only">
              Seu melhor e-mail
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="Seu melhor e-mail"
              className="w-full border border-fa-stone/40 bg-fa-white px-4 py-3 text-sm focus:border-fa-gold focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-fa-black/60">
            <input type="checkbox" name="consent" required className="mt-0.5" />
            Concordo em receber comunicações da FA Perfumaria e posso cancelar minha inscrição a
            qualquer momento.
          </label>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Enviando..." : "Quero receber"}
          </Button>

          {state.status !== "idle" && (
            <p
              role="status"
              className={`text-sm ${state.status === "success" ? "text-green-700" : "text-red-600"}`}
            >
              {state.message}
            </p>
          )}
        </form>
      </Container>
    </section>
  );
}
