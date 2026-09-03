# FA Perfumaria — E-commerce

E-commerce premium da FA Perfumaria (Bombinhas/SC). Next.js (App Router) + TypeScript + Tailwind CSS + Prisma/MySQL.

Em produção: https://faperfumaria.com.br/

Especificação completa do produto: [`CLAUDE.md`](./CLAUDE.md).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** (tokens de marca em `src/app/globals.css`)
- **Prisma 7** + MySQL, com driver adapter `@prisma/adapter-mariadb`
- **Auth.js (next-auth v5)** — login por credenciais (e-mail/senha), sessão JWT
- **Zod** + **React Hook Form** para validação de formulários

## Requisitos

- Node.js 20.9+ (recomendado 22+)
- Acesso a um banco MySQL/MariaDB (ver `DATABASE_URL`)

## Instalação

```bash
npm install
cp .env.example .env
# preencha DATABASE_URL, AUTH_SECRET e demais variáveis em .env
```

Gere um `AUTH_SECRET` seguro com:

```bash
openssl rand -base64 32
```

## Banco de dados

O schema fica em [`prisma/schema.prisma`](./prisma/schema.prisma). Detalhes de modelagem e do fluxo de migrations em [`docs/database.md`](./docs/database.md).

```bash
npx prisma generate      # gera o client em src/generated/prisma
npx prisma migrate deploy  # aplica as migrations existentes
```

Para criar uma nova migration em desenvolvimento, veja o fluxo específico (sem shadow database) documentado em `docs/database.md` — o host atual não permite `CREATE DATABASE`, então `prisma migrate dev` não funciona diretamente.

## Seed

```bash
npm run db:seed
```

Cria (de forma idempotente) um usuário administrador de desenvolvimento. Credenciais configuráveis via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (senão usa um padrão de dev, exibido no console).

## Executar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run db:push` | Sincroniza o schema sem migrations (prototipagem) |
| `npm run db:seed` | Roda o seed de desenvolvimento |

## Build e deploy

```bash
npm run build
npm run start
```

Ver [`docs/deployment.md`](./docs/deployment.md) para notas específicas do ambiente de hospedagem (Hostinger).

## Estrutura

Ver [`docs/architecture.md`](./docs/architecture.md).

## Documentação

- [`docs/architecture.md`](./docs/architecture.md) — organização de pastas e camadas
- [`docs/database.md`](./docs/database.md) — modelagem, migrations, seed
- [`docs/commerce-rules.md`](./docs/commerce-rules.md) — regras de estoque, pedido, cupom, pagamento
- [`docs/admin.md`](./docs/admin.md) — painel administrativo e papéis de acesso
- [`docs/deployment.md`](./docs/deployment.md) — hospedagem e variáveis de produção
- [`docs/integrations.md`](./docs/integrations.md) — pagamento, frete, e-mail e analytics
