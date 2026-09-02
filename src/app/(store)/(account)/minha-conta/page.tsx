import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default async function AccountDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [ordersCount, favoritesCount, lastOrder] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.order.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Olá, {session?.user?.name}</h1>
      <p className="mt-2 text-sm text-fa-black/60">
        Acompanhe seus pedidos, favoritos e dados a partir do menu ao lado.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Link
          href="/minha-conta/pedidos"
          className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 hover:border-fa-gold"
        >
          <p className="text-2xl font-semibold text-fa-black">{ordersCount}</p>
          <p className="text-xs text-fa-black/60">Pedidos</p>
        </Link>
        <Link
          href="/minha-conta/favoritos"
          className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 hover:border-fa-gold"
        >
          <p className="text-2xl font-semibold text-fa-black">{favoritesCount}</p>
          <p className="text-xs text-fa-black/60">Favoritos</p>
        </Link>
      </div>

      {lastOrder && (
        <Link
          href={`/minha-conta/pedidos/${lastOrder.id}`}
          className="mt-6 flex items-center justify-between rounded-sm border border-fa-stone/15 bg-fa-white p-4 hover:border-fa-gold"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-fa-black/50">Último pedido</p>
            <p className="font-medium text-fa-black">{lastOrder.orderNumber}</p>
          </div>
          <Badge variant="outline">{ORDER_STATUS_LABELS[lastOrder.status]}</Badge>
          <p className="font-semibold text-fa-black">{formatPrice(lastOrder.total)}</p>
        </Link>
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <button type="submit" className="text-sm font-medium text-fa-black underline hover:text-fa-gold">
          Sair da conta
        </button>
      </form>
    </div>
  );
}
