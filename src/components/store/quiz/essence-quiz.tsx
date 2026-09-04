"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { getEssenceRecommendations, type QuizResult } from "@/modules/quiz/actions";
import type { QuizAnswers } from "@/modules/quiz/scoring";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface Question {
  key: keyof QuizAnswers;
  kicker: string;
  title: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: Question[] = [
  {
    key: "moment",
    kicker: "O momento",
    title: "Em que momento você mais vai usar esse perfume?",
    options: [
      { label: "Dia a dia, no trabalho ou em compromissos.", value: "fresco" },
      { label: "Encontros e noites especiais.", value: "intenso" },
      { label: "Qualquer ocasião, sem pensar muito.", value: "versatil" },
    ],
  },
  {
    key: "style",
    kicker: "O espelho",
    title: "Qual palavra define melhor o seu estilo?",
    options: [
      { label: "Natural, discreto, sem exageros.", value: "natural" },
      { label: "Elegante, clássico, atento aos detalhes.", value: "classico" },
      { label: "Marcante, ousado, gosto de ser notado.", value: "sedutor" },
    ],
  },
  {
    key: "fixation",
    kicker: "A presença",
    title: "Como você quer que o perfume se comporte na sua pele?",
    options: [
      { label: "Suave — prefiro reaplicar ao longo do dia.", value: "EDC" },
      { label: "Equilibrado — dura o dia todo, sem exagero.", value: "EDT" },
      { label: "Intenso — quero marcar presença por onde eu passar.", value: "EDP" },
    ],
  },
  {
    key: "memory",
    kicker: "Feche os olhos",
    title: "Pensando numa lembrança boa, qual desses cheiros te leva pra lá?",
    options: [
      { label: "Frutas cítricas e uma brisa fresca.", value: "citrico" },
      { label: "Um jardim de flores.", value: "floral" },
      { label: "Madeira nobre, floresta, charuto.", value: "madeira" },
      { label: "Baunilha, chocolate, algo doce e quentinho.", value: "doce" },
    ],
  },
];

const TIPS = [
  "Não esfregue os pulsos: isso quebra as notas de topo e altera a evolução do perfume.",
  "Aguarde 20 minutos: o cheiro inicial muda até as notas de coração e fundo se revelarem.",
  "Aplique em áreas pulsantes (pulsos, pescoço, atrás das orelhas) para maior projeção.",
];

type PartialAnswers = Partial<Record<keyof QuizAnswers, string>>;

export function EssenceQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const question = QUESTIONS[step];

  function selectOption(value: string) {
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    startTransition(async () => {
      const finalAnswers = nextAnswers as unknown as QuizAnswers;
      const recommendations = await getEssenceRecommendations(finalAnswers);
      setResult(recommendations);
    });
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  if (!result && !isPending) {
    return (
      <div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-fa-stone/20">
          <div
            className="h-full rounded-full bg-fa-gold transition-all duration-500"
            style={{ width: `${Math.round(((step + 1) / QUESTIONS.length) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-fa-black/40">
          {Math.round(((step + 1) / QUESTIONS.length) * 100)}%
        </p>

        <div key={step} className="mt-8 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fa-gold">{question.kicker}</p>
          <h2 className="mt-3 font-display text-2xl text-fa-black md:text-3xl">{question.title}</h2>

          <div className="mt-8 space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectOption(option.value)}
                className="w-full rounded-full border border-fa-stone/30 bg-fa-white px-6 py-4 text-left text-sm font-medium text-fa-black shadow-sm transition-all hover:border-fa-gold hover:shadow-md"
              >
                {option.label}
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="mt-8 text-sm text-fa-black/50 underline hover:text-fa-gold"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isPending) {
    return <p className="py-16 text-center text-fa-black/60">Calculando sua essência...</p>;
  }

  const { profile, items } = result!;

  return (
    <div className="animate-fade-in">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fa-gold">Seu perfil olfativo</p>
      <h2 className="mt-3 font-display text-2xl text-fa-black md:text-3xl">Encontramos a sua direção.</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-sm border border-fa-gold/30 bg-fa-gold/5 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-fa-black/50">Família olfativa ideal</p>
          <p className="mt-1 font-display text-2xl text-fa-black">{profile.familyName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-fa-black/50">Concentração recomendada</p>
          <p className="mt-1 font-display text-2xl text-fa-black">{profile.concentrationLabel}</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-xl text-fa-black">Perfumes selecionados para você</h3>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/produto/${item.slug}`}
                className="flex gap-4 border border-fa-stone/20 bg-fa-white p-4 hover:border-fa-gold"
              >
                {item.imageUrl && (
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-fa-off-white">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-fa-gold">{item.score}% compatível</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-fa-black/50">{item.brandName}</p>
                  <p className="font-display text-lg text-fa-black">{item.name}</p>
                  <p className="mt-1 text-sm font-semibold text-fa-black">{formatPrice(item.price)}</p>
                  <p className="mt-2 text-xs text-fa-black/60">{item.explanation}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-fa-stone/15 pt-6">
        <h3 className="font-display text-lg text-fa-black">Regras de ouro para testar na pele</h3>
        <ul className="mt-3 space-y-2 text-sm text-fa-black/70">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-fa-gold">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <Button variant="secondary" className="mt-8" onClick={restart}>
        Refazer o teste
      </Button>
    </div>
  );
}
