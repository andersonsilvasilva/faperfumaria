# Painel administrativo

Rota `/admin`, protegida server-side em [`src/app/admin/layout.tsx`](../src/app/admin/layout.tsx):

1. sem sessão → redireciona para `/entrar?callbackUrl=/admin`;
2. sessão com `role !== "ADMIN"` → redireciona para `/`.

Nenhuma verificação de autorização deve depender apenas do client (esconder um link não é
proteção — toda página/admin API precisa checar `role` no servidor).

## Papéis (roles)

MVP: `CUSTOMER`, `ADMIN` (enum `Role` em `prisma/schema.prisma`). `OPERATOR` e `MARKETING`
ficam para uma fase futura — não criar agora para evitar complexidade sem uso real.

## Seções (sidebar)

Dashboard, Produtos, Categorias, Marcas, Pedidos, Estoque, Clientes, Cupons, Banners,
Newsletter, Configurações — implementadas na Fase 5. Hoje (`Fase 1`) só o Dashboard existe,
como placeholder.

## Auditoria

Toda ação administrativa sensível (alterar produto, pedido, estoque, cupom) deve gravar uma
linha em `AdminAuditLog` (quem, o quê, antes/depois) — implementar junto com cada feature da
Fase 5, não como retrofit posterior.
