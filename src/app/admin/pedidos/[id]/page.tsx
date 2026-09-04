import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderForAdmin } from "@/modules/admin/orders-queries";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, SHIPPING_METHOD_LABELS } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Detalhe do pedido | Admin",
};

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

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const hasAddress = order.shippingMethod !== "LOCAL_PICKUP";
  const canConfirmCashPayment = order.payments.some((p) => p.method === "CASH" && p.status === "PENDING");

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl text-fa-black">{order.orderNumber}</h1>
        <Badge variant={STATUS_BADGE_VARIANT[order.status] ?? "outline"}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>
      <p className="mt-1 text-sm text-fa-black/50">
        Criado em{" "}
        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <h2 className="font-display text-lg text-fa-black">Itens</h2>
            <div className="mt-4 divide-y divide-fa-stone/15">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="text-fa-black">{item.productNameSnapshot}</p>
                    <p className="text-fa-black/50">
                      {item.variantLabelSnapshot} · {item.quantity}x
                    </p>
                  </div>
                  <p className="font-medium text-fa-black">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-fa-stone/15 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-fa-black/70">Subtotal</dt>
                <dd className="text-fa-black">{formatPrice(order.subtotal)}</dd>
              </div>
              {Number(order.discountTotal.toString()) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-fa-black/70">Desconto</dt>
                  <dd className="text-green-700">−{formatPrice(order.discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-fa-black/70">Frete ({order.shippingLabel})</dt>
                <dd className="text-fa-black">{formatPrice(order.shippingTotal)}</dd>
              </div>
              <div className="flex justify-between border-t border-fa-stone/20 pt-2 text-base font-semibold">
                <dt className="text-fa-black">Total</dt>
                <dd className="text-fa-black">{formatPrice(order.total)}</dd>
              </div>
            </dl>
            {order.giftWrap && (
              <div className="mt-4 rounded-sm border border-fa-stone/15 bg-fa-off-white p-3 text-sm">
                <Badge variant="outline">Embrulhado para presente</Badge>
                {order.giftMessage && <p className="mt-2 text-fa-black/70">&ldquo;{order.giftMessage}&rdquo;</p>}
              </div>
            )}
          </section>

          <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <h2 className="font-display text-lg text-fa-black">Entrega</h2>
            <p className="mt-2 text-sm text-fa-black/70">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            {hasAddress && (
              <p className="mt-2 text-sm text-fa-black/70">
                {order.shippingStreet}, {order.shippingNumber}
                {order.shippingComplement ? ` — ${order.shippingComplement}` : ""}
                <br />
                {order.shippingNeighborhood} — {order.shippingCity}/{order.shippingState}
                <br />
                CEP {order.shippingZipCode}
              </p>
            )}
            {order.shipment && (
              <p className="mt-3 text-sm text-fa-black/70">
                {order.shipment.carrier && <>Transportadora: {order.shipment.carrier}<br /></>}
                {order.shipment.trackingCode && <>Rastreio: {order.shipment.trackingCode}</>}
              </p>
            )}
          </section>

          <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <h2 className="font-display text-lg text-fa-black">Pagamentos</h2>
            <div className="mt-4 space-y-2">
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-sm">
                  <span className="text-fa-black/70">
                    {payment.method} · {payment.provider}
                  </span>
                  <span className="text-fa-black">
                    {payment.status} — {formatPrice(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <h2 className="font-display text-lg text-fa-black">Cliente</h2>
            <p className="mt-2 text-sm text-fa-black">{order.contactName}</p>
            <p className="text-sm text-fa-black/60">{order.contactEmail}</p>
            <p className="text-sm text-fa-black/60">{order.contactPhone}</p>
            <p className="text-sm text-fa-black/60">CPF {order.contactCpf}</p>
            {order.user && <p className="mt-2 text-xs text-fa-black/40">Conta: {order.user.email}</p>}
          </section>

          <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <h2 className="font-display text-lg text-fa-black">Atualizar status</h2>
            <div className="mt-4">
              <OrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
                canConfirmCashPayment={canConfirmCashPayment}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
