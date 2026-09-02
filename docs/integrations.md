# Integrações externas

Todas as integrações externas seguem o mesmo princípio: **interface abstrata + implementação
real + modo mock explícito** para desenvolvimento sem credenciais (seção 6 do `CLAUDE.md`).
Nenhuma integração está implementada ainda (Fase 3/6) — este documento registra a arquitetura
planejada.

## Pagamento

```ts
interface PaymentProvider {
  createPixPayment(...): Promise<...>
  createCardPayment(...): Promise<...>
  getPaymentStatus(...): Promise<...>
  refundPayment(...): Promise<...>
}
```

Implementação principal: Mercado Pago (`MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY`,
`MERCADO_PAGO_WEBHOOK_SECRET`). Webhooks sempre validados por assinatura antes de processar.
Nunca armazenar dados de cartão — isso é responsabilidade do provider (tokenização).

## Frete

Provider abstrato com três modos: retirada na loja (grátis), entrega local (Bombinhas, Porto
Belo, Itapema — regiões configuráveis no Admin, não fixas no código) e frete nacional via
provider externo (`SHIPPING_PROVIDER`, `SHIPPING_API_TOKEN`).

## E-mail transacional

Provider abstraído (`EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`). Templates: pedido
recebido, pagamento aprovado, pedido em preparação/enviado/entregue, pagamento recusado,
cancelamento, redefinição de senha.

## Analytics

Google Analytics 4 (`NEXT_PUBLIC_GA_ID`) e Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`), carregados
apenas se as variáveis estiverem definidas. Eventos: `view_item`, `view_item_list`, `search`,
`add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_payment_info`, `purchase`,
`add_to_wishlist`. `purchase` só dispara após confirmação real de pagamento — nunca no
redirecionamento do checkout.
