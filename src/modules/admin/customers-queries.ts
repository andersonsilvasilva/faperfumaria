import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const ADMIN_CUSTOMER_PAGE_SIZE = 20;

const PAID_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

export async function listCustomersForAdmin({ search, page = 1 }: { search?: string; page?: number }) {
  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_CUSTOMER_PAGE_SIZE,
      take: ADMIN_CUSTOMER_PAGE_SIZE,
      include: {
        orders: { where: { status: { in: [...PAID_STATUSES] } }, select: { total: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const customers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    orderCount: user.orders.length,
    totalSpent: user.orders.reduce((sum, o) => sum + Number(o.total.toString()), 0),
  }));

  return { customers, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_CUSTOMER_PAGE_SIZE)) };
}

export async function getCustomerForAdmin(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!user || user.role !== "CUSTOMER") return null;
  return user;
}
