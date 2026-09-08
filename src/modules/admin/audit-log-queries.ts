import "server-only";
import { prisma } from "@/lib/prisma";

export const AUDIT_LOG_PAGE_SIZE = 30;

export async function listAuditLogs({ page = 1 }: { page?: number } = {}) {
  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * AUDIT_LOG_PAGE_SIZE,
      take: AUDIT_LOG_PAGE_SIZE,
    }),
    prisma.adminAuditLog.count(),
  ]);

  return { logs, total, pageCount: Math.max(1, Math.ceil(total / AUDIT_LOG_PAGE_SIZE)) };
}
