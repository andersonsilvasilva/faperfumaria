import type { Metadata } from "next";
import { getDashboardMetrics } from "@/modules/admin/dashboard-queries";
import { MetricCard } from "@/components/admin/dashboard/metric-card";
import { SalesLineChart } from "@/components/admin/dashboard/sales-line-chart";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Dashboard</h1>
      <p className="mt-1 text-sm text-fa-black/60">Últimos 30 dias, com destaque para hoje.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Vendas hoje" value={String(metrics.todayOrderCount)} />
        <MetricCard label="Faturamento hoje" value={formatPrice(metrics.todayRevenue)} />
        <MetricCard label="Pedidos (30 dias)" value={String(metrics.periodOrderCount)} />
        <MetricCard label="Ticket médio (30 dias)" value={formatPrice(metrics.averageTicket)} />
        <MetricCard label="Faturamento (30 dias)" value={formatPrice(metrics.periodRevenue)} />
        <MetricCard label="Itens vendidos (30 dias)" value={String(metrics.itemsSoldInPeriod)} />
        <MetricCard label="Novos clientes (30 dias)" value={String(metrics.newCustomersInPeriod)} />
        <MetricCard
          label="Produtos com estoque baixo"
          value={String(metrics.lowStockCount)}
          danger={metrics.lowStockCount > 0}
          hint={metrics.lowStockCount > 0 ? "Ver em Estoque" : undefined}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesLineChart
            periods={[
              {
                key: "mes-atual",
                label: "Mês atual",
                data: metrics.salesSeries.currentMonth,
                dateFormat: { day: "2-digit", month: "2-digit" },
              },
              {
                key: "6-meses",
                label: "6 meses",
                data: metrics.salesSeries.last6Months,
                dateFormat: { month: "short", year: "2-digit" },
              },
              {
                key: "1-ano",
                label: "1 ano",
                data: metrics.salesSeries.last12Months,
                dateFormat: { month: "short", year: "2-digit" },
              },
            ]}
          />
        </div>

        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-lg text-fa-black">Mais vendidos (30 dias)</h2>
          {metrics.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-fa-black/50">Sem vendas confirmadas ainda.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {metrics.topProducts.map((product, index) => (
                <li key={`${product.name}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-fa-black/80">
                    {index + 1}. {product.name}
                  </span>
                  <span className="font-medium text-fa-black">{product.quantity}x</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
