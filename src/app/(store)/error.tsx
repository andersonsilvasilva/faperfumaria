"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Erro na loja:", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="font-display text-2xl text-fa-black">Algo deu errado por aqui</h1>
      <p className="max-w-md text-sm text-fa-black/70">
        Não conseguimos carregar esta página agora. Tente novamente em instantes — se o problema
        continuar, fale com a gente pelo WhatsApp.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={reset}>Tentar novamente</Button>
        <ButtonLink href="/" variant="secondary">
          Voltar para a home
        </ButtonLink>
      </div>
    </Container>
  );
}
