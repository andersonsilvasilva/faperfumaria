"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rankCandidates, type QuizAnswers, type QuizCandidate } from "@/modules/quiz/scoring";

const answersSchema = z.object({
  categorySlug: z.enum(["masculino", "feminino", "unissex"]),
  personalitySlug: z.string().min(1),
  occasionSlug: z.string().min(1),
  intensity: z.enum(["SUAVE", "MODERADA", "MARCANTE", "INTENSA"]),
  priceRangeValue: z.string().min(1),
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

export async function getEssenceRecommendations(rawAnswers: QuizAnswers): Promise<QuizResultItem[]> {
  const answers = answersSchema.parse(rawAnswers);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      brand: true,
      images: { where: { isMain: true }, take: 1 },
      categories: { include: { category: true } },
      olfactoryFamily: true,
      profileTags: { include: { tag: true } },
    },
  });

  const candidates: QuizCandidate[] = products.map((product) => ({
    id: product.id,
    price: Number(product.price.toString()),
    intensity: product.intensity,
    olfactoryFamilyName: product.olfactoryFamily?.name ?? null,
    categorySlugs: product.categories.map((c) => c.category.slug),
    personalityTags: product.profileTags.filter((pt) => pt.tag.type === "PERSONALITY").map((pt) => pt.tag),
    occasionTags: product.profileTags.filter((pt) => pt.tag.type === "OCCASION").map((pt) => pt.tag),
  }));

  const matches = rankCandidates(candidates, answers);
  const productById = new Map(products.map((product) => [product.id, product]));

  return matches.map((match) => {
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
}
