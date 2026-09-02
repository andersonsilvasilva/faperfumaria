import type { Intensity } from "@/generated/prisma/client";
import { INTENSITY_ORDER } from "@/lib/labels";
import { PRICE_RANGES } from "@/modules/catalog/params";

export interface QuizAnswers {
  categorySlug: string;
  personalitySlug: string;
  occasionSlug: string;
  intensity: Intensity;
  priceRangeValue: string;
}

interface Tag {
  slug: string;
  name: string;
}

export interface QuizCandidate {
  id: string;
  price: number;
  intensity: Intensity | null;
  olfactoryFamilyName: string | null;
  categorySlugs: string[];
  personalityTags: Tag[];
  occasionTags: Tag[];
}

export interface QuizMatch {
  id: string;
  score: number;
  explanation: string;
}

const WEIGHTS = {
  category: 30,
  personality: 20,
  occasion: 20,
  intensityExact: 15,
  intensityAdjacent: 7,
  price: 15,
} as const;

const MAX_SCORE =
  WEIGHTS.category + WEIGHTS.personality + WEIGHTS.occasion + WEIGHTS.intensityExact + WEIGHTS.price;

function intensityDistance(a: Intensity, b: Intensity) {
  return Math.abs(INTENSITY_ORDER.indexOf(a) - INTENSITY_ORDER.indexOf(b));
}

function isWithinPriceRange(price: number, rangeValue: string) {
  const range = PRICE_RANGES.find((r) => r.value === rangeValue);
  if (!range) return false;
  if (range.min != null && price < range.min) return false;
  if (range.max != null && price > range.max) return false;
  return true;
}

function scoreCandidate(candidate: QuizCandidate, answers: QuizAnswers): number {
  let score = 0;

  if (candidate.categorySlugs.includes(answers.categorySlug)) {
    score += WEIGHTS.category;
  }

  if (candidate.personalityTags.some((tag) => tag.slug === answers.personalitySlug)) {
    score += WEIGHTS.personality;
  }

  if (candidate.occasionTags.some((tag) => tag.slug === answers.occasionSlug)) {
    score += WEIGHTS.occasion;
  }

  if (candidate.intensity) {
    const distance = intensityDistance(candidate.intensity, answers.intensity);
    if (distance === 0) score += WEIGHTS.intensityExact;
    else if (distance === 1) score += WEIGHTS.intensityAdjacent;
  }

  if (isWithinPriceRange(candidate.price, answers.priceRangeValue)) {
    score += WEIGHTS.price;
  }

  return score;
}

function buildExplanation(candidate: QuizCandidate, answers: QuizAnswers): string {
  const parts: string[] = [];

  if (candidate.olfactoryFamilyName) {
    parts.push(candidate.olfactoryFamilyName.toLowerCase());
  }

  const matchedPersonality = candidate.personalityTags.find((tag) => tag.slug === answers.personalitySlug);
  if (matchedPersonality) {
    parts.push(matchedPersonality.name.toLowerCase());
  } else if (candidate.intensity) {
    parts.push(candidate.intensity === answers.intensity ? "no ponto certo de intensidade" : "com boa fixação");
  }

  const traits = parts.length > 0 ? parts.join(", ") : "um perfil equilibrado";
  const matchedOccasion = candidate.occasionTags.find((tag) => tag.slug === answers.occasionSlug);

  return matchedOccasion
    ? `Recomendamos esta fragrância por seu perfil ${traits}, especialmente indicada para ${matchedOccasion.name.toLowerCase()}.`
    : `Recomendamos esta fragrância por seu perfil ${traits}.`;
}

export function rankCandidates(candidates: QuizCandidate[], answers: QuizAnswers): QuizMatch[] {
  const scored = candidates
    .map((candidate) => ({
      id: candidate.id,
      score: Math.round((scoreCandidate(candidate, answers) / MAX_SCORE) * 100),
      explanation: buildExplanation(candidate, answers),
    }))
    .sort((a, b) => b.score - a.score);

  const relevant = scored.filter((match) => match.score > 0);
  const pool = relevant.length >= 3 ? relevant : scored;

  return pool.slice(0, 6);
}
