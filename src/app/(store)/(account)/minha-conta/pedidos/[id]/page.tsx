import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderDetail, orderDetailInclude } from "@/components/store/order/order-detail";

export const metadata: Metadata = {
  title: "Detalhes do pedido",
};

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: orderDetailInclude,
  });

  if (!order || order.userId !== session!.user.id) notFound();

  return <OrderDetail order={order} />;
}
