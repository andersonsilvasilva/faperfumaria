# Deploy

> Este documento será expandido na Fase 7 (QA/Deploy). Registra, desde já, o que já se sabe
> sobre o ambiente de hospedagem contratado, para não ser descoberto tarde.

## Ambiente atual (Hostinger)

- Banco MySQL/MariaDB acessível remotamente (host, usuário e senha em `.env`, nunca versionados
  — ver `Dados da Empresa.txt`, que está no `.gitignore` por conter credenciais reais).
- Domínio temporário em produção já provisionado.
- Acesso SSH disponível.

**Ponto em aberto**: hospedagem compartilhada Hostinger é tradicionalmente orientada a
PHP/Apache. Antes da Fase 7, confirmar se o plano contratado suporta um processo Node.js de
longa duração (Next.js precisa de `next start` rodando, ou de exportação/adapters específicos)
— caso não suporte, as opções são: (a) usar apenas o MySQL da Hostinger e hospedar a aplicação
Next.js em uma plataforma com suporte a Node (ex.: Vercel, VPS), ou (b) migrar para um plano
Hostinger com suporte a Node.js/VPS. O MySQL remoto já funciona independente de onde a aplicação
rodar.

## Variáveis obrigatórias em produção

Ver [`.env.example`](../.env.example). Especial atenção a:

- `AUTH_SECRET` — gerar um valor novo e forte para produção (nunca reaproveitar o de dev);
- `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` — domínio real de produção;
- credenciais do Mercado Pago (produção, não sandbox) quando o checkout for para o ar.

## Migrations em produção

```bash
npx prisma migrate deploy
```

Não usa shadow database — funciona no plano atual mesmo sem permissão de `CREATE DATABASE`
(ver `docs/database.md`).

## Build

```bash
npm run build
npm run start
```
