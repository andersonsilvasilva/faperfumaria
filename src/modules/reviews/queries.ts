import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VERIFIED_PURCHASE_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewSummary(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  return { average: result._avg.rating ?? 0, count: result._count };
}

export interface ReviewEligibility {
  canReview: boolean;
  reason?: "not-logged-in" | "already-reviewed" | "no-purchase";
}

export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
  const session = await auth();
  if (!session?.user) return { canReview: false, reason: "not-logged-in" };

  const existingReview = await prisma.review.findFirst({
    where: { productId, userId: session.user.id },
  });
  if (existingReview) return { canReview: false, reason: "already-reviewed" };

  const purchase = await prisma.orderItem.findFirst({
    where: {
      variant: { productId },
      order: { userId: session.user.id, status: { in: [...VERIFIED_PURCHASE_STATUSES] } },
    },
  });
  if (!purchase) return { canReview: false, reason: "no-purchase" };

  return { canReview: true };
}
