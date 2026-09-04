import "server-only";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export interface DashboardMetrics {
  todayOrderCount: number;
  todayRevenue: number;
  periodOrderCount: number;
  periodRevenue: number;
  averageTicket: number;
  itemsSoldInPeriod: number;
  newCustomersInPeriod: number;
  lowStockCount: number;
  topProducts: { name: string; quantity: number }[];
  salesByDay: { date: string; total: number; count: number }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const todayStart = startOfDay(new Date());
  const periodStart = new Date(todayStart);
  periodStart.setDate(periodStart.getDate() - 29);

  const [todayAgg, periodOrders, newCustomersInPeriod, variants, topProductsRaw] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [...PAID_STATUSES] }, paidAt: { gte: todayStart } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] }, paidAt: { gte: periodStart } },
      select: { total: true, paidAt: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: periodStart } } }),
    prisma.productVariant.findMany({
      where: { isActive: true },
      select: { stockQty: true, minStockQty: true },
    }),
    prisma.orderItem.groupBy({
      by: ["variantId"],
      where: { order: { status: { in: [...PAID_STATUSES] }, paidAt: { gte: periodStart } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const periodRevenue = periodOrders.reduce((sum, o) => sum + Number(o.total.toString()), 0);
  const periodOrderCount = periodOrders.length;

  const salesByDayMap = new Map<string, { total: number; count: number }>();
  for (let i = 0; i < 30; i++) {
    const day = new Date(periodStart);
    day.setDate(day.getDate() + i);
    salesByDayMap.set(day.toISOString().slice(0, 10), { total: 0, count: 0 });
  }
  for (const order of periodOrders) {
    if (!order.paidAt) continue;
    const key = order.paidAt.toISOString().slice(0, 10);
    const entry = salesByDayMap.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(order.total.toString());
    entry.count += 1;
    salesByDayMap.set(key, entry);
  }

  const variantIds = topProductsRaw.map((row) => row.variantId);
  const variantDetails = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true } } },
  });
  const variantNameById = new Map(variantDetails.map((v) => [v.id, v.product.name]));

  return {
    todayOrderCount: todayAgg._count,
    todayRevenue: Number((todayAgg._sum.total ?? 0).toString()),
    periodOrderCount,
    periodRevenue,
    averageTicket: periodOrderCount > 0 ? periodRevenue / periodOrderCount : 0,
    itemsSoldInPeriod: topProductsRaw.reduce((sum, row) => sum + (row._sum.quantity ?? 0), 0),
    newCustomersInPeriod,
    lowStockCount: variants.filter((v) => v.stockQty <= v.minStockQty).length,
    topProducts: topProductsRaw.map((row) => ({
      name: variantNameById.get(row.variantId) ?? "Produto removido",
      quantity: row._sum.quantity ?? 0,
    })),
    salesByDay: Array.from(salesByDayMap.entries()).map(([date, { total, count }]) => ({
      date,
      total,
      count,
    })),
  };
}
