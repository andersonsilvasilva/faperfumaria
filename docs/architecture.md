# Arquitetura

Monólito modular moderno (Next.js App Router). Sem microserviços nesta fase.

## Estrutura de pastas

```text
src/
├── app/
│   ├── (store)/          # storefront público — Header + Footer
│   │   ├── (account)/    # área logada do cliente (auth gate em layout.tsx)
│   │   ├── entrar/       # login (Credentials)
│   │   └── page.tsx      # Home
│   ├── admin/            # painel administrativo — auth gate (role ADMIN)
│   ├── api/              # route handlers (ex.: api/auth/[...nextauth])
│   └── layout.tsx        # shell HTML raiz, fontes, metadata global
│
├── components/
│   ├── ui/               # componentes de design system (Button, Container, ...)
│   ├── store/            # componentes do storefront (Header, Footer, ...)
│   └── admin/            # componentes do painel admin
│
├── lib/                  # infraestrutura cross-cutting (prisma, auth, password)
├── modules/              # regras de negócio por domínio (criado conforme necessário)
├── schemas/              # validação Zod (criado conforme necessário)
├── types/                # augmentations de tipos (ex.: next-auth.d.ts)
└── generated/prisma/     # client gerado pelo Prisma — NÃO versionado, NÃO editar
```

## Grupos de rota

- `(store)` engloba todo o storefront público e usa um único `layout.tsx` para renderizar
  `Header`/`Footer` — evita duplicar o chrome do site em cada rota.
- `(account)` fica **aninhado dentro de `(store)`** propositalmente: assim herda Header/Footer
  e adiciona só o gate de autenticação + navegação lateral da conta.
- `admin` é uma rota literal (não um grupo) porque precisa do prefixo `/admin` na URL e tem
  shell próprio (sidebar preta, sem Header/Footer do storefront).

## Autenticação

Auth.js (`next-auth` v5) com **Credentials provider** e sessão **JWT** — decisão deliberada:
o Credentials provider não suporta estratégia de sessão em banco (`database`) nativamente, e o
MVP não exige login social. Isso elimina a necessidade das tabelas `Account`/`Session`/
`VerificationToken` do adapter Prisma, mantendo o schema mais simples. Ver `src/lib/auth.ts`.

Proteção de rotas é feita **server-side em cada layout** (`(account)/layout.tsx`,
`admin/layout.tsx`), chamando `auth()` e redirecionando — não usamos `middleware`/`proxy` para
isso, por simplicidade e porque o Next.js 16 exige runtime Node.js em `proxy.ts` (o antigo
`middleware.ts`), sem benefício adicional aqui.

## Design tokens

Tailwind CSS v4 usa configuração via CSS (`@theme` em `src/app/globals.css`), não
`tailwind.config.ts`. As cores e fontes da marca (seção 55 do `CLAUDE.md`) viram utilities
automaticamente: `bg-fa-black`, `text-fa-gold`, `font-display`, etc.
