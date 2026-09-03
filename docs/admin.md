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
  linha continua na lista, o que já é sinal suficiente para uso interno; o logo aceita upload
  de arquivo ou URL colada (ver seção "Upload de imagens" abaixo).
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
  - **Imagens aceitam upload de arquivo ou URL colada** (ver "Upload de imagens" abaixo);
    substituição completa da lista a cada save (sem histórico dependente).
  - Excluir produto não existe como ação — "Desativar" (`isActive=false`) é a forma de remover
    um produto da vitrine sem arriscar quebrar FK de pedidos antigos.
- **Avaliações** (`/admin/avaliacoes`) — moderação de avaliações de produto (seção 37 do
  CLAUDE.md): lista todas as avaliações (qualquer produto), com busca e filtro de status,
  permitindo apenas ocultar/reexibir (`toggleReviewVisibilityAction`) — **nunca edita nota ou
  comentário do cliente**. Avaliações continuam sendo aprovadas automaticamente ao serem
  enviadas (compra verificada já é exigida em `getReviewEligibility`); esta tela é uma rede de
  segurança para remover spam depois, não uma fila de pré-aprovação.
- **Clientes** (`/admin/clientes`, `.../[id]`) — somente leitura: lista com busca, total gasto
  e nº de pedidos (calculados a partir de pedidos pagos); detalhe mostra endereços e histórico
  de pedidos. Não há criação/edição de cliente pelo Admin (conta é sempre self-service).
- **Cupons** (`/admin/cupons`, `.../novo`, `.../[id]`) — CRUD completo. Restrição por categoria
  é checkbox; por produto é uma lista de nomes exatos separados por vírgula (sem
  autocomplete/multi-select nesta fase — catálogo pequeno o suficiente para digitar o nome).
- **Banners** (`/admin/banners`, `.../novo`, `.../[id]`) — CRUD completo. Imagens (desktop/
  mobile) aceitam upload de arquivo ou URL colada, mesmo campo reutilizável de "Imagens" dos
  produtos.
- **Newsletter** (`/admin/newsletter`) — somente leitura: lista de inscritos com opt-in de
  marketing, origem e data.
- **Configurações** (`/admin/configuracoes`) — editor genérico de `StoreSetting` (chave + valor
  JSON em textarea), em vez de uma tela dedicada por configuração — hoje só existe
  `local_delivery_pricing` (ver `docs/integrations.md`), e novas configurações futuras não
  exigem uma nova tela, só uma nova chave.

## Upload de imagens

`POST /api/admin/upload` ([`src/app/api/admin/upload/route.ts`](../src/app/api/admin/upload/route.ts))
recebe `multipart/form-data` (`file` + `folder`), valida sessão admin, tipo (JPEG/PNG/WEBP/GIF),
tamanho (máx. 5MB) e pasta de destino (allowlist: `produtos`, `marcas`, `banners` — nunca aceita
um valor arbitrário do cliente, para não permitir path traversal), grava em
`/public/uploads/<pasta>/<uuid>.<ext>` e devolve a URL pública. Componente reutilizável:
`src/components/admin/upload/image-upload-field.tsx` (campo de texto + botão de upload +
preview) — usado em Produtos (imagens), Marcas (logo) e Banners (desktop/mobile). O campo de
texto continua editável manualmente, então uma URL externa colada também funciona.

**Sem storage em nuvem configurado** — grava direto no disco do servidor (`/public/uploads/`,
fora do git, ver `.gitignore`). Isso funciona em qualquer hospedagem Node tradicional com disco
persistente (o modelo esperado para a Hostinger, ver `docs/deployment.md`), mas **não
funcionaria em hospedagem serverless** (disco efêmero, ex.: Vercel) — se a aplicação for para
esse tipo de ambiente no futuro, essa rota precisa trocar para um provider de storage em nuvem
(S3-compatível, etc.). Também importante: como o diretório de uploads não é versionado, ele
**não é criado automaticamente ao clonar o repo em produção** (a rota cria com `mkdir
recursive` na primeira vez que alguém faz upload) e **não tem backup automático** — garantir que
a estratégia de backup do servidor de produção inclua `/public/uploads/`.

## Auditoria

Toda ação administrativa sensível grava uma linha em `AdminAuditLog` (quem, o quê,
antes/depois). Hoje: mudança de status de pedido. Implementar junto com cada nova feature da
Fase 5, não como retrofit posterior.
