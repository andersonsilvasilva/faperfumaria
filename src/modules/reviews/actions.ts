"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getReviewEligibility } from "@/modules/reviews/queries";

export interface ReviewActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const reviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Conte um pouco mais sobre o produto (mínimo 10 caracteres)."),
});

export async function createReviewAction(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "Entre na sua conta para avaliar este produto." };
  }

  const eligibility = await getReviewEligibility(parsed.data.productId);
  if (!eligibility.canReview) {
    const message =
      eligibility.reason === "already-reviewed"
        ? "Você já avaliou este produto."
        : "Só clientes com compra confirmada podem avaliar este produto.";
    return { status: "error", message };
  }

  await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      isVerifiedPurchase: true,
      status: "APPROVED",
    },
  });

  revalidatePath(`/produto/${parsed.data.productSlug}`);
  return { status: "success", message: "Obrigado pela sua avaliação!" };
}
