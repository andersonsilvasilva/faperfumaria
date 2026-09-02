import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerForAdmin } from "@/modules/admin/customers-queries";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Detalhe do cliente | Admin",
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerForAdmin(id);
  if (!customer) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-fa-black">{customer.name}</h1>
      <p className="mt-1 text-sm text-fa-black/60">
        {customer.email} {customer.phone && `· ${customer.phone}`}
      </p>
      <p className="mt-1 text-xs text-fa-black/40">
        Cliente desde{" "}
        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(customer.createdAt)}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-lg text-fa-black">Endereços</h2>
          {customer.addresses.length === 0 ? (
            <p className="mt-3 text-sm text-fa-black/50">Nenhum endereço cadastrado.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm text-fa-black/70">
              {customer.addresses.map((address) => (
                <li key={address.id}>
                  <p className="font-medium text-fa-black">{address.label}</p>
                  <p>
                    {address.street}, {address.number} — {address.neighborhood}
                  </p>
                  <p>
                    {address.city}/{address.state} · CEP {address.zipCode}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-lg text-fa-black">Pedidos recentes</h2>
          {customer.orders.length === 0 ? (
            <p className="mt-3 text-sm text-fa-black/50">Nenhum pedido ainda.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {customer.orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between">
                  <Link href={`/admin/pedidos/${order.id}`} className="text-fa-black hover:text-fa-gold">
                    {order.orderNumber}
                  </Link>
                  <span className="flex items-center gap-2">
                    <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
                    <span className="text-fa-black/70">{formatPrice(order.total)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
