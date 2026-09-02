import "server-only";
import type { Prisma } from "@/generated/prisma/client";

/** Deve ser chamado de dentro de uma transação, para evitar números duplicados sob concorrência. */
export async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FA-${year}-`;

  const last = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const lastSeq = last ? parseInt(last.orderNumber.slice(prefix.length), 10) || 0 : 0;
  const nextSeq = lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(6, "0")}`;
}
