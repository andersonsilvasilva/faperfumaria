import type { Metadata } from "next";
import Link from "next/link";
import { listOrdersForAdmin } from "@/modules/admin/orders-queries";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Pedidos | Admin",
};

export const dynamic = "force-dynamic";

const STATUS_BADGE_VARIANT: Record<string, "success" | "danger" | "outline" | "gold"> = {
  PAID: "success",
  DELIVERED: "success",
  SHIPPED: "success",
  PREPARING: "outline",
  PENDING_PAYMENT: "gold",
  CANCELLED: "danger",
  PAYMENT_FAILED: "danger",
  REFUNDED: "outline",
};

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const validStatus = STATUS_OPTIONS.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const { orders, total, pageCount } = await listOrdersForAdmin({
    status: validStatus,
    search: q?.trim(),
    page: currentPage,
  });

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const next = { status: validStatus, q, page: String(currentPage), ...overrides };
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return query ? `/admin/pedidos?${query}` : "/admin/pedidos";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Pedidos</h1>
        <p className="text-sm text-fa-black/60">{total} pedido(s)</p>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/pedidos">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nº do pedido, cliente ou e-mail"
          className="h-10 w-72 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
        <select
          name="status"
          defaultValue={validStatus ?? ""}
          className="h-10 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-sm bg-fa-black px-4 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 font-medium text-fa-black">{order.orderNumber}</td>
                <td className="px-4 py-3 text-fa-black/70">
                  {order.contactName}
                  <br />
                  <span className="text-xs text-fa-black/40">{order.contactEmail}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE_VARIANT[order.status] ?? "outline"}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-fa-black">{formatPrice(order.total)}</td>
                <td className="px-4 py-3 text-fa-black/60">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                    order.createdAt,
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pedidos/${order.id}`} className="text-fa-gold hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: String(p) })}
              className={`rounded-sm px-3 py-1 ${
                p === currentPage ? "bg-fa-black text-fa-white" : "border border-fa-stone/30 text-fa-black/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
