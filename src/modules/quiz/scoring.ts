import type { Intensity } from "@/generated/prisma/client";
import { INTENSITY_ORDER } from "@/lib/labels";

export type Moment = "fresco" | "intenso" | "versatil";
export type Style = "natural" | "classico" | "sedutor";
export type Fixation = "EDC" | "EDT" | "EDP";
export type Memory = "citrico" | "floral" | "madeira" | "doce";

export interface QuizAnswers {
  moment: Moment;
  style: Style;
  fixation: Fixation;
  memory: Memory;
}

interface Tag {
  slug: string;
  name: string;
}

export interface QuizCandidate {
  id: string;
  intensity: Intensity | null;
  concentration: string | null;
  olfactoryFamilyName: string | null;
  personalityTags: Tag[];
  occasionTags: Tag[];
}

export interface QuizMatch {
  id: string;
  score: number;
  explanation: string;
}

export interface IdealProfile {
  familyName: string;
  concentrationLabel: string;
}

const FAMILY_BY_MEMORY: Record<Memory, string> = {
  citrico: "Cítrico",
  floral: "Floral",
  madeira: "Amadeirado",
  doce: "Gourmand",
};

const CONCENTRATION_BY_FIXATION: Record<Fixation, { label: string; keyword: string; intensity: Intensity }> = {
  EDC: { label: "Eau de Cologne", keyword: "cologne", intensity: "SUAVE" },
  EDT: { label: "Eau de Toilette", keyword: "toilette", intensity: "MODERADA" },
  EDP: { label: "Eau de Parfum", keyword: "parfum", intensity: "INTENSA" },
};

const PERSONALITIES_BY_STYLE: Record<Style, string[]> = {
  natural: ["fresca", "discreta"],
  classico: ["elegante", "sofisticada"],
  sedutor: ["sedutora", "marcante"],
};

const OCCASIONS_BY_MOMENT: Record<Moment, string[]> = {
  fresco: ["dia-a-dia", "trabalho"],
  intenso: ["noite", "encontros"],
  versatil: ["trabalho", "presente"],
};

const WEIGHTS = {
  family: 35,
  concentration: 20,
  intensityExact: 15,
  intensityAdjacent: 7,
  style: 20,
  moment: 10,
} as const;

const MAX_SCORE = WEIGHTS.family + WEIGHTS.concentration + WEIGHTS.intensityExact + WEIGHTS.style + WEIGHTS.moment;

function intensityDistance(a: Intensity, b: Intensity) {
  return Math.abs(INTENSITY_ORDER.indexOf(a) - INTENSITY_ORDER.indexOf(b));
}

/** Família e concentração ideais, resolvidas direto das respostas — sempre existe um resultado
 * de cabeçalho, mesmo que nenhum produto do catálogo seja um match perfeito. */
export function resolveIdealProfile(answers: QuizAnswers): IdealProfile {
  return {
    familyName: FAMILY_BY_MEMORY[answers.memory],
    concentrationLabel: CONCENTRATION_BY_FIXATION[answers.fixation].label,
  };
}

function scoreCandidate(candidate: QuizCandidate, answers: QuizAnswers): number {
  let score = 0;
  const profile = resolveIdealProfile(answers);
  const targetIntensity = CONCENTRATION_BY_FIXATION[answers.fixation].intensity;
  const concentrationKeyword = CONCENTRATION_BY_FIXATION[answers.fixation].keyword;

  if (candidate.olfactoryFamilyName === profile.familyName) {
    score += WEIGHTS.family;
  }

  if (candidate.concentration?.toLowerCase().includes(concentrationKeyword)) {
    score += WEIGHTS.concentration;
  }

  if (candidate.intensity) {
    const distance = intensityDistance(candidate.intensity, targetIntensity);
    if (distance === 0) score += WEIGHTS.intensityExact;
    else if (distance === 1) score += WEIGHTS.intensityAdjacent;
  }

  const stylePersonalities = PERSONALITIES_BY_STYLE[answers.style];
  if (candidate.personalityTags.some((tag) => stylePersonalities.includes(tag.slug))) {
    score += WEIGHTS.style;
  }

  const momentOccasions = OCCASIONS_BY_MOMENT[answers.moment];
  if (candidate.occasionTags.some((tag) => momentOccasions.includes(tag.slug))) {
    score += WEIGHTS.moment;
  }

  return score;
}

function buildExplanation(candidate: QuizCandidate, answers: QuizAnswers): string {
  const parts: string[] = [];

  if (candidate.olfactoryFamilyName) {
    parts.push(candidate.olfactoryFamilyName.toLowerCase());
  }

  const stylePersonalities = PERSONALITIES_BY_STYLE[answers.style];
  const matchedPersonality = candidate.personalityTags.find((tag) => stylePersonalities.includes(tag.slug));
  if (matchedPersonality) {
    parts.push(matchedPersonality.name.toLowerCase());
  }

  const traits = parts.length > 0 ? parts.join(", ") : "um perfil equilibrado";
  const momentOccasions = OCCASIONS_BY_MOMENT[answers.moment];
  const matchedOccasion = candidate.occasionTags.find((tag) => momentOccasions.includes(tag.slug));

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
