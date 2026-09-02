# Banco de dados

MySQL/MariaDB via Prisma 7 + `@prisma/adapter-mariadb` (driver `mariadb`, não `mysql2` — é a
forma padrão do Prisma 7 para MySQL/MariaDB; ver `.claude/skills/prisma-database-setup/`).

Client gerado em `src/generated/prisma` (path customizado no generator, não versionado).
Singleton de conexão em `src/lib/prisma.ts`.

## Ambientes: local (Laragon) vs. remoto (Hostinger)

Desenvolvimento do dia a dia usa **MySQL local via Laragon** (`DATABASE_URL` apontando para
`127.0.0.1:3306`, banco `fa_perfumaria`, usuário `root` sem senha). Motivo: o banco remoto da
Hostinger é uma conta de hospedagem compartilhada com um limite baixo de conexões simultâneas
por usuário — reinícios repetidos do `next dev` (comuns durante o desenvolvimento) esgotaram
esse limite (`ER_USER_LIMIT_REACHED`) e derrubaram o site em pleno teste. Local não tem esse
problema e é bem mais rápido.

Com MySQL local (usuário `root` com privilégios completos), o fluxo normal do Prisma funciona
sem restrições: `prisma migrate dev` funciona de verdade (cria shadow database sem problema).
As migrations continuam as mesmas — foram criadas contra o banco remoto pelo fluxo abaixo, mas
`prisma migrate deploy` as aplica normalmente em qualquer banco (local ou remoto), sem precisar
de shadow database.

O banco remoto da Hostinger continua sendo o de produção — usar `prisma migrate deploy` (nunca
`migrate dev`) para aplicar migrations nele, e trocar o `DATABASE_URL` só na hora do deploy (ver
`docs/deployment.md`). Não usar o banco remoto para desenvolvimento/testes do dia a dia.

## Particularidade do hosting Hostinger: sem shadow database

O usuário do banco remoto **não tem permissão `CREATE DATABASE`**, então `prisma migrate dev`
falha lá (ele precisa criar um shadow database temporário para calcular o diff) — só afeta o
banco remoto; localmente isso não é um problema (ver seção acima).

Fluxo usado para criar/alterar migrations quando só o banco remoto está disponível (sem shadow
database):

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

`prisma/seed.ts` roda via `tsx` (configurado em `prisma.config.ts`), de forma idempotente
(`upsert`). Cria um usuário `ADMIN` de desenvolvimento, catálogo de exemplo (marcas, categorias,
famílias olfativas, notas, tags de perfil e 12 produtos com variantes), o cupom `BEMVINDO10` e a
configuração de frete local — dados claramente de desenvolvimento, nunca usar em produção
(seção 54 do `CLAUDE.md`).

**`ProductVariant` usa `upsert` por `sku`, nunca `deleteMany`+`createMany`** — diferente das
outras entidades do catálogo. Motivo: assim que existem pedidos reais, `OrderItem` e
`InventoryMovement` referenciam o `id` da variante; apagar e recriar quebra essas referências
(erro de foreign key) e recriar com nova `stockQty` apagaria vendas/reservas reais. O `upsert`
também **não sobrescreve `stockQty`** de uma variante já existente, só na criação inicial.

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
