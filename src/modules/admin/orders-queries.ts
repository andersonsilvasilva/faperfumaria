import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export const ADMIN_ORDER_PAGE_SIZE = 20;

export async function listOrdersForAdmin({
  status,
  search,
  page = 1,
}: {
  status?: OrderStatus;
  search?: string;
  page?: number;
}) {
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { contactName: { contains: search } },
            { contactEmail: { contains: search } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_ORDER_PAGE_SIZE,
      take: ADMIN_ORDER_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_ORDER_PAGE_SIZE)) };
}

export const adminOrderDetailInclude = {
  items: true,
  payments: { orderBy: { createdAt: "desc" as const } },
  shipment: true,
  user: { select: { name: true, email: true } },
} satisfies Prisma.OrderInclude;

export async function getOrderForAdmin(id: string) {
  return prisma.order.findUnique({ where: { id }, include: adminOrderDetailInclude });
}
