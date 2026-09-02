"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

/**
 * Alterna entre HIDDEN e APPROVED — nunca altera nota/comentário do cliente (seção 37 do
 * CLAUDE.md: "Admin pode ocultar spam/conteúdo impróprio, mas não alterar texto do cliente
 * silenciosamente"). Uma avaliação oculta some da página do produto (getProductReviews só
 * busca status:"APPROVED"), mas continua no banco para auditoria.
 */
export async function toggleReviewVisibilityAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin.ok) return;

  const reviewId = formData.get("reviewId")?.toString();
  if (!reviewId) return;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;

  const nextStatus = review.status === "HIDDEN" ? "APPROVED" : "HIDDEN";

  await prisma.$transaction([
    prisma.review.update({ where: { id: reviewId }, data: { status: nextStatus } }),
    prisma.adminAuditLog.create({
      data: {
        adminId: admin.userId,
        action: "REVIEW_STATUS_UPDATE",
        entityType: "Review",
        entityId: reviewId,
        beforeJson: { status: review.status },
        afterJson: { status: nextStatus },
      },
    }),
  ]);

  revalidatePath("/admin/avaliacoes");
}
