"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rankCandidates, resolveIdealProfile, type IdealProfile, type QuizAnswers, type QuizCandidate } from "@/modules/quiz/scoring";

const answersSchema = z.object({
  moment: z.enum(["fresco", "intenso", "versatil"]),
  style: z.enum(["natural", "classico", "sedutor"]),
  fixation: z.enum(["EDC", "EDT", "EDP"]),
  memory: z.enum(["citrico", "floral", "madeira", "doce"]),
});

export interface QuizResultItem {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  price: number;
  imageUrl: string | null;
  score: number;
  explanation: string;
}

export interface QuizResult {
  profile: IdealProfile;
  items: QuizResultItem[];
}

export async function getEssenceRecommendations(rawAnswers: QuizAnswers): Promise<QuizResult> {
  const answers = answersSchema.parse(rawAnswers);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      brand: true,
      images: { where: { isMain: true }, take: 1 },
      olfactoryFamily: true,
      profileTags: { include: { tag: true } },
    },
  });

  const candidates: QuizCandidate[] = products.map((product) => ({
    id: product.id,
    intensity: product.intensity,
    concentration: product.concentration,
    olfactoryFamilyName: product.olfactoryFamily?.name ?? null,
    personalityTags: product.profileTags.filter((pt) => pt.tag.type === "PERSONALITY").map((pt) => pt.tag),
    occasionTags: product.profileTags.filter((pt) => pt.tag.type === "OCCASION").map((pt) => pt.tag),
  }));

  const matches = rankCandidates(candidates, answers);
  const productById = new Map(products.map((product) => [product.id, product]));

  const items = matches.map((match) => {
    const product = productById.get(match.id)!;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brandName: product.brand.name,
      price: Number(product.price.toString()),
      imageUrl: product.images[0]?.url ?? null,
      score: match.score,
      explanation: match.explanation,
    };
  });

  return { profile: resolveIdealProfile(answers), items };
}
