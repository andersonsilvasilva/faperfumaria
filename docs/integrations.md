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
`MERCADO_PAGO_WEBHOOK_SECRET`, `MERCADO_PAGO_CLIENT_ID`, `MERCADO_PAGO_CLIENT_SECRET`). Webhooks
sempre validados por assinatura antes de processar. Nunca armazenar dados de cartão — isso é
responsabilidade do provider (tokenização).

**As credenciais já configuradas em `.env` são de PRODUÇÃO** (prefixo `APP_USR-`), fornecidas
pelo cliente — processam pagamentos reais, não são credenciais de sandbox/teste. Antes de
implementar e testar o `PaymentProvider` na Fase 3:

- usar o provider **mock** (seção 6 do CLAUDE.md) para todo o desenvolvimento e testes
  automatizados do fluxo de checkout;
- só exercitar as credenciais reais manualmente, de forma consciente, quando for validar a
  integração de fato — nunca em CI/testes automatizados;
- se for necessário testar cartões/fluxos de pagamento repetidamente durante o desenvolvimento,
  considerar pedir ao cliente credenciais de teste (`TEST-...`) do Mercado Pago para não gerar
  cobranças reais.

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
