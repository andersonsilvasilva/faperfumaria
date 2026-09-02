import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, ReviewStatus } from "@/generated/prisma/client";

export const ADMIN_REVIEW_PAGE_SIZE = 20;

export async function listReviewsForAdmin({
  status,
  search,
  page = 1,
}: {
  status?: ReviewStatus;
  search?: string;
  page?: number;
}) {
  const where: Prisma.ReviewWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { comment: { contains: search } },
            { product: { name: { contains: search } } },
            { user: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_REVIEW_PAGE_SIZE,
      take: ADMIN_REVIEW_PAGE_SIZE,
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_REVIEW_PAGE_SIZE)) };
}
