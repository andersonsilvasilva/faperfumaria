import "server-only";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export interface SalesPoint {
  date: string;
  total: number;
  count: number;
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
  salesSeries: {
    currentMonth: SalesPoint[];
    last6Months: SalesPoint[];
    last12Months: SalesPoint[];
  };
}

/** Agrupa pedidos pagos em baldes (dia ou mês), preenchendo os baldes vazios com zero pra
 * manter o eixo do tempo contínuo mesmo sem vendas naquele dia/mês. */
function bucketOrders(
  orders: { total: import("@/generated/prisma/client").Prisma.Decimal; paidAt: Date | null }[],
  bucketDates: Date[],
  granularity: "day" | "month",
): SalesPoint[] {
  const keyOf = (d: Date) => (granularity === "day" ? d.toISOString().slice(0, 10) : d.toISOString().slice(0, 7));

  const map = new Map<string, SalesPoint>();
  for (const d of bucketDates) {
    const key = keyOf(d);
    map.set(key, { date: key, total: 0, count: 0 });
  }
  for (const order of orders) {
    if (!order.paidAt) continue;
    const key = keyOf(order.paidAt);
    const entry = map.get(key);
    if (!entry) continue;
    entry.total += Number(order.total.toString());
    entry.count += 1;
  }
  return Array.from(map.values());
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const todayStart = startOfDay(new Date());
  const periodStart = new Date(todayStart);
  periodStart.setDate(periodStart.getDate() - 29);

  const currentMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const sixMonthsStart = new Date(todayStart.getFullYear(), todayStart.getMonth() - 5, 1);
  const twelveMonthsStart = new Date(todayStart.getFullYear(), todayStart.getMonth() - 11, 1);

  const [todayAgg, periodOrders, yearOrders, newCustomersInPeriod, variants, topProductsRaw] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [...PAID_STATUSES] }, paidAt: { gte: todayStart } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] }, paidAt: { gte: periodStart } },
      select: { total: true, paidAt: true },
    }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] }, paidAt: { gte: twelveMonthsStart } },
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

  const daysInCurrentMonth: Date[] = [];
  for (let d = new Date(currentMonthStart); d <= todayStart; d.setDate(d.getDate() + 1)) {
    daysInCurrentMonth.push(new Date(d));
  }

  const monthsSince = (start: Date, count: number) =>
    Array.from({ length: count }, (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1));

  const salesSeries = {
    currentMonth: bucketOrders(
      yearOrders.filter((o) => o.paidAt && o.paidAt >= currentMonthStart),
      daysInCurrentMonth,
      "day",
    ),
    last6Months: bucketOrders(
      yearOrders.filter((o) => o.paidAt && o.paidAt >= sixMonthsStart),
      monthsSince(sixMonthsStart, 6),
      "month",
    ),
    last12Months: bucketOrders(yearOrders, monthsSince(twelveMonthsStart, 12), "month"),
  };

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
    salesSeries,
  };
}
