"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRICE_RANGES } from "@/modules/catalog/params";
import { getEssenceRecommendations, type QuizResultItem } from "@/modules/quiz/actions";
import type { QuizAnswers } from "@/modules/quiz/scoring";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface Question {
  key: keyof QuizAnswers;
  title: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: Question[] = [
  {
    key: "categorySlug",
    title: "Para quem é a fragrância?",
    options: [
      { label: "Masculino", value: "masculino" },
      { label: "Feminino", value: "feminino" },
      { label: "Unissex", value: "unissex" },
    ],
  },
  {
    key: "personalitySlug",
    title: "Que presença deseja transmitir?",
    options: [
      { label: "Elegante", value: "elegante" },
      { label: "Sedutora", value: "sedutora" },
      { label: "Fresca", value: "fresca" },
      { label: "Marcante", value: "marcante" },
      { label: "Sofisticada", value: "sofisticada" },
      { label: "Discreta", value: "discreta" },
    ],
  },
  {
    key: "occasionSlug",
    title: "Quando pretende usar?",
    options: [
      { label: "Dia a dia", value: "dia-a-dia" },
      { label: "Trabalho", value: "trabalho" },
      { label: "Encontros", value: "encontros" },
      { label: "Festas", value: "festas" },
      { label: "Noite", value: "noite" },
    ],
  },
  {
    key: "intensity",
    title: "Qual intensidade prefere?",
    options: [
      { label: "Suave", value: "SUAVE" },
      { label: "Moderada", value: "MODERADA" },
      { label: "Marcante", value: "MARCANTE" },
      { label: "Muito intensa", value: "INTENSA" },
    ],
  },
  {
    key: "priceRangeValue",
    title: "Quanto pretende investir?",
    options: PRICE_RANGES.map((range) => ({ label: range.label, value: range.value })),
  },
];

type PartialAnswers = Partial<Record<keyof QuizAnswers, string>>;

export function EssenceQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [results, setResults] = useState<QuizResultItem[] | null>(null);
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
      setResults(recommendations);
    });
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResults(null);
  }

  if (isPending) {
    return <p className="py-16 text-center text-fa-black/60">Calculando sua essência...</p>;
  }

  if (results) {
    return (
      <div>
        <h2 className="font-display text-2xl text-fa-black">Sua essência</h2>
        <p className="mt-2 text-sm text-fa-black/60">
          Encontramos {results.length} fragrância{results.length === 1 ? "" : "s"} para você.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/produto/${result.slug}`}
              className="flex gap-4 border border-fa-stone/20 bg-fa-white p-4 hover:border-fa-gold"
            >
              {result.imageUrl && (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-fa-off-white">
                  <Image src={result.imageUrl} alt={result.name} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-fa-gold">{result.score}% compatível</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-fa-black/50">{result.brandName}</p>
                <p className="font-display text-lg text-fa-black">{result.name}</p>
                <p className="mt-1 text-sm font-semibold text-fa-black">{formatPrice(result.price)}</p>
                <p className="mt-2 text-xs text-fa-black/60">{result.explanation}</p>
              </div>
            </Link>
          ))}
        </div>

        <Button variant="secondary" className="mt-8" onClick={restart}>
          Refazer o quiz
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">
        Pergunta {step + 1} de {QUESTIONS.length}
      </p>
      <h2 className="mt-3 font-display text-2xl text-fa-black">{question.title}</h2>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => selectOption(option.value)}
            className="border border-fa-stone/30 bg-fa-white px-5 py-4 text-left text-sm font-medium text-fa-black transition-colors hover:border-fa-gold hover:text-fa-gold"
          >
            {option.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="mt-6 text-sm text-fa-black/50 underline hover:text-fa-gold"
        >
          Voltar
        </button>
      )}
    </div>
  );
}
