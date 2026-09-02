import type { Intensity, OrderStatus } from "@/generated/prisma/client";

export const INTENSITY_LABELS: Record<Intensity, string> = {
  SUAVE: "Suave",
  MODERADA: "Moderada",
  MARCANTE: "Marcante",
  INTENSA: "Intensa",
};

export const INTENSITY_ORDER: Intensity[] = ["SUAVE", "MODERADA", "MARCANTE", "INTENSA"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  PAID: "Pagamento aprovado",
  PREPARING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  PAYMENT_FAILED: "Falha no pagamento",
  REFUNDED: "Reembolsado",
};
