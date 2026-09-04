import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Meus pedidos",
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

export default async function MeusPedidosPage() {
  const session = await auth();
  const [orders, reviewedProducts] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { variant: { select: { productId: true } } } } },
    }),
    prisma.review.findMany({ where: { userId: session!.user.id }, select: { productId: true } }),
  ]);
  const reviewedProductIds = new Set(reviewedProducts.map((r) => r.productId));

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Meus pedidos</h1>

      {orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-fa-stone/40 py-16 text-center">
          <p className="text-sm text-fa-black/60">Você ainda não fez nenhum pedido.</p>
          <ButtonLink href="/loja" className="mt-6">
            Explorar perfumes
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-fa-stone/15 rounded-sm border border-fa-stone/15 bg-fa-white">
          {orders.map((order) => {
            const productIds = Array.from(new Set(order.items.map((item) => item.variant.productId)));
            const allReviewed = productIds.every((id) => reviewedProductIds.has(id));

            return (
              <Link
                key={order.id}
                href={`/minha-conta/pedidos/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-fa-off-white"
              >
                <div>
                  <p className="font-medium text-fa-black">{order.orderNumber}</p>
                  <p className="text-xs text-fa-black/50">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={STATUS_BADGE_VARIANT[order.status] ?? "outline"}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  {order.status === "DELIVERED" && (
                    <Badge variant={allReviewed ? "outline" : "gold"}>
                      {allReviewed ? "Já avaliado" : "Avaliar"}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-fa-black">{formatPrice(order.total)}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
