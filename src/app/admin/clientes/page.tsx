import type { Metadata } from "next";
import Link from "next/link";
import { listCustomersForAdmin } from "@/modules/admin/customers-queries";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Clientes | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { customers, total, pageCount } = await listCustomersForAdmin({ search: q?.trim(), page: currentPage });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Clientes</h1>
        <p className="text-sm text-fa-black/60">{total} cliente(s)</p>
      </div>

      <form className="mt-6" action="/admin/clientes">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou e-mail"
          className="h-10 w-72 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Total gasto</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">{customer.name}</td>
                <td className="px-4 py-3 text-fa-black/60">{customer.email}</td>
                <td className="px-4 py-3 text-fa-black/60">{customer.orderCount}</td>
                <td className="px-4 py-3 text-fa-black">{formatPrice(customer.totalSpent)}</td>
                <td className="px-4 py-3 text-fa-black/60">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(customer.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/clientes/${customer.id}`} className="text-fa-gold hover:underline">
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
              href={`/admin/clientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`}
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
