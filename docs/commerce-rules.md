# Regras de comércio

> Fase 3 (Commerce) implementada: carrinho, cupom, frete, checkout, pedido e pagamento (mock +
> Mercado Pago real para PIX). Fluxo testado ponta a ponta com Playwright (não versionado —
> scripts de verificação temporários, removidos após o uso).

## Estoque

```text
Carrinho   → não altera estoque
Pedido     → reserva (InventoryMovement: RESERVATION) — decrementa ProductVariant.stockQty
             na hora, dentro da mesma transação que cria o Order
Pagamento aprovado   → confirma saída (InventoryMovement: SALE) — não decrementa de novo,
                        só registra a movimentação (o estoque já saiu na reserva)
Pagamento recusado/cancelado (webhook explícito) → o webhook do Mercado Pago já libera o
                        estoque reservado (InventoryMovement: RELEASE) e envia e-mail ao
                        cliente quando a notificação chega como REJECTED/CANCELLED.
Pagamento nunca notificado → EM ABERTO: ainda não há um job liberando o estoque de pedidos PIX
                        que nunca recebem NENHUMA notificação do Mercado Pago (QR code gerado e
                        simplesmente abandonado pelo cliente, sem expiração/cancelamento
                        explícitos). Necessário antes de produção — hoje esse caso específico
                        ainda prende o estoque indefinidamente.
```

Overselling evitado via `updateMany({ where: { stockQty: { gte: quantity } }, data: {
decrement } })` dentro de uma transação — atômico no nível de linha no MySQL/InnoDB, sem
precisar de `SELECT ... FOR UPDATE` manual. Ver `src/modules/orders/actions.ts`.

## Preço e totais

O total do pedido é **sempre calculado no servidor**, a partir dos preços atuais em
`ProductVariant`/`Product` — nunca a partir de valores recebidos do cliente. Cupom e frete
também são validados/recalculados no servidor.

## Cupom

Validações obrigatórias no servidor antes de aplicar:

- ativo (`isActive`) e dentro da janela `startsAt`/`endsAt`;
- pedido mínimo (`minOrderValue`);
- limite total de usos (`maxUses`) e por cliente (`maxUsesPerCustomer`, via `CouponUsage`);
- se restrito a produtos/categorias (`CouponProduct`/`CouponCategory`), o carrinho precisa
  conter ao menos um item elegível.

## Número do pedido

Formato público `FA-{ano}-{sequencial 6 dígitos}` (ex.: `FA-2026-000001`), gerado no momento da
criação do pedido — nunca expor o `id` (cuid) como identificador público.

## Status do pedido

Enum `OrderStatus` (`PENDING_PAYMENT`, `PAID`, `PREPARING`, `SHIPPED`, `DELIVERED`,
`CANCELLED`, `PAYMENT_FAILED`, `REFUNDED`) — tradução amigável para o cliente fica na camada de
apresentação, nunca no banco.

## Pagamento e frete

Ver `docs/integrations.md` para detalhes de implementação (providers, webhook, limitações
atuais do pagamento por cartão).

## Embrulho para presente

`Cart.giftWrap` / `Cart.giftMessage` (editável na página do carrinho) são copiados para
`Order.giftWrap` / `Order.giftMessage` na criação do pedido. Sem custo adicional — decisão
deliberada para não introduzir uma sub-precificação nova nesta fase.
