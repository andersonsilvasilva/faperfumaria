import "server-only";
import { prisma } from "@/lib/prisma";

export async function listCouponsForAdmin() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });
}

export async function getCouponForAdmin(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
    include: {
      categories: true,
      products: { include: { product: { select: { name: true } } } },
    },
  });
}

export async function getCouponFormOptions() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
