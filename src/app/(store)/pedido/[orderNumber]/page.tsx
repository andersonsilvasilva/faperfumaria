import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { SimulatePaymentButton } from "@/components/store/order/simulate-payment-button";

export const metadata: Metadata = {
  title: "Confirmação do pedido",
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

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const latestPayment = order.payments[0];
  const isPixPending = latestPayment?.method === "PIX" && latestPayment.status === "PENDING";
  const qrCodeText = (latestPayment?.rawPayload as { qrCodeText?: string } | null)?.qrCodeText;

  return (
    <Container className="max-w-3xl py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">Pedido confirmado</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-fa-black">{order.orderNumber}</h1>
        <Badge variant={STATUS_BADGE_VARIANT[order.status] ?? "outline"}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-fa-black/60">
        Enviamos os detalhes para <strong>{order.contactEmail}</strong>.
      </p>

      {order.giftWrap && (
        <div className="mt-6 rounded-sm border border-fa-stone/15 bg-fa-white p-4 text-sm">
          <Badge variant="outline">Embrulhado para presente</Badge>
          {order.giftMessage && <p className="mt-2 text-fa-black/70">&ldquo;{order.giftMessage}&rdquo;</p>}
        </div>
      )}

      {isPixPending && (
        <div className="mt-8 rounded-sm border border-fa-gold/40 bg-fa-gold/10 p-6 text-center">
          <p className="font-display text-lg text-fa-black">Pague com PIX para confirmar seu pedido</p>
          {qrCodeText && (
            <p className="mx-auto mt-3 max-w-md break-all rounded-sm border border-fa-stone/20 bg-fa-white p-3 text-xs text-fa-black/70">
              {qrCodeText}
            </p>
          )}
          <p className="mt-3 text-xs text-fa-black/50">
            Copie o código acima no app do seu banco (Pix Copia e Cola).
          </p>
          {latestPayment?.provider === "mock" && (
            <div className="mt-4">
              <SimulatePaymentButton orderNumber={order.orderNumber} />
            </div>
          )}
        </div>
      )}

      <div className="mt-10 rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Itens</p>
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
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/loja" className="text-sm font-medium text-fa-black underline hover:text-fa-gold">
          Continuar comprando
        </Link>
      </div>
    </Container>
  );
}
