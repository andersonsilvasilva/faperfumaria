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
- **Categorias** (`/admin/categorias`) e **Marcas** (`/admin/marcas`) — CRUD simples (criar,
  editar, excluir). Categoria suporta hierarquia (`parentId`); excluir uma categoria com filhas
  só desvincula (`SetNull`), não bloqueia. **Marca com produtos vinculados não pode ser
  excluída** (`Product.brandId` é obrigatório, sem cascade) — o delete falha silenciosamente e a
  linha continua na lista, o que já é sinal suficiente para uso interno; não há upload de
  arquivo para o logo, só uma URL colada (mesma decisão de "Imagens" abaixo).
- **Produtos** (`/admin/produtos`, `.../novo`, `.../[id]`) — formulário único em seções
  (Informações/Preço/Fragrância/Variantes/Imagens/SEO), em
  `src/components/admin/products/product-form.tsx` +
  `src/modules/admin/products-actions.ts`. Pontos importantes:
  - Notas de fragrância são digitadas como texto separado por vírgula por camada (saída/
    coração/fundo); ao salvar, cada nome é `upsert`ado em `FragranceNote` (nome é único) e as
    linhas de `ProductFragranceNote` daquela camada são recriadas do zero.
  - Categorias e tags de perfil (ocasião/estação/personalidade) são checkboxes; substituição
    completa das linhas de junção a cada save (sem histórico dependente, seguro).
  - **Variantes nunca são apagadas** por este formulário — só atualizadas (se já têm `id`) ou
    criadas (se novas), porque `OrderItem`/`InventoryMovement` podem referenciar o `id` de uma
    variante existente (mesma lição do seed, ver `docs/database.md`). Uma variante "removida"
    pelo admin deve ser desativada (`isActive=false`), não excluída.
  - **Estoque inicial de uma variante nova é sempre 0** — o formulário de produto não grava
    `stockQty` diretamente; o admin ajusta em `/admin/estoque` logo depois, para manter uma
    única trilha de auditoria (`InventoryMovement`) para toda mudança de estoque.
  - **Imagens não têm upload de arquivo** — apenas URL colada (nesta fase, sem storage
    configurado); substituição completa da lista a cada save (sem histórico dependente).
  - Excluir produto não existe como ação — "Desativar" (`isActive=false`) é a forma de remover
    um produto da vitrine sem arriscar quebrar FK de pedidos antigos.
- **Clientes, Cupons, Banners, Newsletter, Configurações** — ainda não implementados
  (placeholders na sidebar).

## Auditoria

Toda ação administrativa sensível grava uma linha em `AdminAuditLog` (quem, o quê,
antes/depois). Hoje: mudança de status de pedido. Implementar junto com cada nova feature da
Fase 5, não como retrofit posterior.
