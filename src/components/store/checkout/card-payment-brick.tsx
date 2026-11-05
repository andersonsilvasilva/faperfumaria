"use client";

import { useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";

export interface CardBrickResult {
  token: string;
  paymentMethodId: string;
  issuerId: string;
  installments: number;
  holderCpf?: string;
}

/**
 * Formulário de cartão hospedado pelo Mercado Pago (Card Payment Brick). Os dados do cartão são
 * digitados em campos do próprio Mercado Pago (iframes) e viram um token de uso único — nada
 * disso passa pelo nosso servidor, que só recebe o token (ver CLAUDE.md, seção 30).
 *
 * Valor e parcelas finais são sempre recalculados/validados no servidor; o que o navegador
 * envia aqui não é confiável para preço.
 */
export function CardPaymentBrick({
  publicKey,
  amount,
  maxInstallments,
  onSubmit,
}: {
  publicKey: string;
  amount: number;
  maxInstallments: number;
  onSubmit: (result: CardBrickResult) => Promise<void>;
}) {
  // Inicializa o SDK uma vez por montagem, antes do primeiro render do Brick.
  useState(() => {
    initMercadoPago(publicKey, { locale: "pt-BR" });
    return true;
  });

  return (
    <CardPayment
      locale="pt-BR"
      initialization={{ amount }}
      customization={{
        paymentMethods: {
          minInstallments: 1,
          maxInstallments,
          // Só crédito: é onde existe parcelamento.
          types: { included: ["credit_card"] },
        },
      }}
      onSubmit={async (param) => {
        const data = param;
        await onSubmit({
          token: data.token,
          paymentMethodId: data.payment_method_id,
          issuerId: String(data.issuer_id ?? ""),
          installments: Number(data.installments) || 1,
          holderCpf: data.payer?.identification?.number,
        });
      }}
    />
  );
}
