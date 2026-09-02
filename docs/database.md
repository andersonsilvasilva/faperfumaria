# Banco de dados

MySQL/MariaDB via Prisma 7 + `@prisma/adapter-mariadb` (driver `mariadb`, não `mysql2` — é a
forma padrão do Prisma 7 para MySQL/MariaDB; ver `.claude/skills/prisma-database-setup/`).

Client gerado em `src/generated/prisma` (path customizado no generator, não versionado).
Singleton de conexão em `src/lib/prisma.ts`.

## Particularidade do hosting atual: sem shadow database

O banco de produção/desenvolvimento atual está na Hostinger (hospedagem compartilhada). O
usuário do banco **não tem permissão `CREATE DATABASE`**, então `prisma migrate dev` falha
(ele precisa criar um shadow database temporário para calcular o diff).

Fluxo usado para criar a migration inicial, sem shadow database:

```bash
# 1. gera o SQL comparando "vazio" com o schema atual (não toca no banco)
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script \
  > prisma/migrations/<timestamp>_nome/migration.sql

# 2. aplica esse SQL diretamente no banco configurado (não precisa de shadow db)
npx prisma db execute --file prisma/migrations/<timestamp>_nome/migration.sql

# 3. marca a migration como aplicada no histórico do Prisma
npx prisma migrate resolve --applied "<timestamp>_nome"
```

Para novas alterações de schema, repita esse fluxo (ou, se o plano de hospedagem mudar e
permissão de `CREATE DATABASE` for concedida, `prisma migrate dev` volta a funcionar
normalmente).

`prisma migrate deploy` funciona normalmente em CI/produção (não precisa de shadow database).

## Seed

`prisma/seed.ts` roda via `tsx` (configurado em `prisma.config.ts`). Hoje cria apenas um
usuário `ADMIN` de desenvolvimento, de forma idempotente (`upsert` por e-mail). Dados de
catálogo (marcas, categorias, produtos, variantes, notas olfativas) serão adicionados na
Fase 2, junto com o storefront que os consome.

## Decisões de modelagem

- **Dinheiro**: sempre `Decimal` (`@db.Decimal(10,2)`), nunca `Float`.
- **Estoque por variante** (`ProductVariant.stockQty`), não por produto — cada volume/SKU
  controla seu próprio estoque.
- **Movimentação de estoque** (`InventoryMovement`) é append-only; o saldo em
  `ProductVariant.stockQty` é a fonte de verdade para consulta rápida, mas toda alteração deve
  gerar uma linha de movimentação para auditoria (ver `docs/commerce-rules.md`).
- **Tags de perfil** (`FragranceProfileTag` + `ProductProfileTag`): modelo genérico para
  ocasião/estação/personalidade, usado tanto nos filtros da loja quanto no algoritmo de scoring
  do quiz "Descubra sua Essência".
- **Cupom por produto/categoria** (`CouponProduct`, `CouponCategory`): tabelas de junção não
  listadas explicitamente na seção 44 do `CLAUDE.md`, mas necessárias para implementar a
  restrição "produtos; categorias" exigida na seção 35.
