# Painel administrativo

Rota `/admin`, protegida server-side em [`src/app/admin/layout.tsx`](../src/app/admin/layout.tsx):

1. sem sessão → redireciona para `/entrar?callbackUrl=/admin`;
2. sessão com `role !== "ADMIN"` → redireciona para `/`.

Nenhuma verificação de autorização deve depender apenas do client (esconder um link não é
proteção — toda página/admin API precisa checar `role` no servidor).

**Server Actions não são protegidas pelo layout** — o guard de `admin/layout.tsx` só impede a
renderização da página; uma Server Action é um endpoint HTTP separado. Por isso toda action do
Admin chama `requireAdmin()` ([`src/lib/require-admin.ts`](../src/lib/require-admin.ts)) como
primeira linha, retornando erro amigável se a sessão não existir ou não for `ADMIN` — nunca
lança exceção não tratada.

## Papéis (roles)

MVP: `CUSTOMER`, `ADMIN` (enum `Role` em `prisma/schema.prisma`). `OPERATOR` e `MARKETING`
ficam para uma fase futura — não criar agora para evitar complexidade sem uso real.

## Seções (sidebar) — status da Fase 5

- **Dashboard** (`/admin`) — implementado: vendas/faturamento hoje e nos últimos 30 dias,
  ticket médio, itens vendidos, novos clientes, contagem de estoque baixo, gráfico de vendas
  por dia (barras em CSS, sem lib de gráfico) e top 5 produtos. Métricas sempre calculadas do
  banco (nunca fabricadas), em `src/modules/admin/dashboard-queries.ts`.
- **Pedidos** (`/admin/pedidos`, `/admin/pedidos/[id]`) — implementado: lista com busca/filtro
  de status e paginação; detalhe com itens, endereço de entrega, pagamentos e formulário de
  transição de status (`src/components/admin/orders/order-status-form.tsx` +
  `src/modules/admin/orders-actions.ts`). Transições permitidas: `PAID → PREPARING/CANCELLED`,
  `PREPARING → SHIPPED/CANCELLED`, `SHIPPED → DELIVERED`. Cancelar libera a reserva de estoque
  (`InventoryMovementType.RELEASE`) e dispara o e-mail transacional correspondente
  (`sendOrderEmail`, ver `docs/integrations.md`). `SHIPPED` também grava transportadora/código
  de rastreio em `Shipment`.
- **Estoque** (`/admin/estoque`) — implementado: lista de variantes com destaque de estoque
  baixo (`stockQty <= minStockQty`, filtrado em memória — catálogo pequeno, não precisa de SQL
  cru) e ajuste manual (`+`/`-`) que grava `InventoryMovementType.ADJUSTMENT`.
- **Produtos, Categorias, Marcas, Clientes, Cupons, Banners, Newsletter, Configurações** —
  ainda não implementados (placeholders na sidebar).

## Auditoria

Toda ação administrativa sensível grava uma linha em `AdminAuditLog` (quem, o quê,
antes/depois). Hoje: mudança de status de pedido. Implementar junto com cada nova feature da
Fase 5, não como retrofit posterior.
