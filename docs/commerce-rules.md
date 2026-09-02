# Regras de comércio

> Este documento evolui junto com as Fases 3 e 4 (Commerce e Cliente). Nesta fase (Fundação),
> registra as regras já decididas na modelagem para que a implementação futura seja consistente.

## Estoque

```text
Carrinho   → não altera estoque
Pedido     → reserva temporária (InventoryMovement: RESERVATION)
Pagamento aprovado   → confirma saída (InventoryMovement: SALE)
Pagamento expirado/cancelado → libera reserva (InventoryMovement: RELEASE)
```

Nunca permitir overselling: qualquer alteração de `ProductVariant.stockQty` deve ser feita em
transação, validando estoque disponível no momento da escrita (não confiar em leitura anterior).

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

Arquitetura de provider (interface `PaymentProvider` / `ShippingProvider`) para permitir modo
mock em desenvolvimento sem credenciais reais. Implementação principal: Mercado Pago (pagamento)
e provider abstrato de frete com retirada local, entrega local (Bombinhas, Porto Belo, Itapema)
e frete nacional. Detalhes de configuração em `docs/integrations.md`.
