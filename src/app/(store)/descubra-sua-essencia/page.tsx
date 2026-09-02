import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { EssenceQuiz } from "@/components/store/quiz/essence-quiz";

export const metadata: Metadata = {
  title: "Descubra sua Essência",
  description: "Responda 5 perguntas rápidas e descubra as fragrâncias com maior compatibilidade com você.",
};

export default function DescubraSuaEssenciaPage() {
  return (
    <Container className="max-w-3xl py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">Descubra sua Essência</p>
      <h1 className="mt-3 font-display text-3xl text-fa-black md:text-4xl">
        Qual perfume combina com você?
      </h1>
      <p className="mt-4 max-w-xl text-fa-black/70">
        Responda 5 perguntas rápidas e descubra as fragrâncias com maior compatibilidade com o seu
        estilo.
      </p>

      <div className="mt-12">
        <EssenceQuiz />
      </div>
    </Container>
  );
}
