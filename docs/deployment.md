# Deploy

**Status: em produção desde 2026-09-03 em https://faperfumaria.com.br/**, hospedado numa VPS
própria do cliente (não é mais a Hostinger — ver "Histórico" no fim deste documento para o porquê
da migração).

## Ambiente de hospedagem

VPS Ubuntu 22.04.5 LTS que também hospeda outras aplicações do mesmo cliente (Veloterap, gestor
de relatórios, Zeloo.net) — **cuidado ao mexer via SSH, nunca tocar em nada fora de
`/var/www/faperfumaria/`**, do banco `faperfumaria` e da porta 3001/site Nginx `faperfumaria`.

Stack: **Nginx** (proxy reverso) + **Certbot** (SSL Let's Encrypt, renovação automática) +
**PM2** (gerencia o processo Node, `pm2-root.service` no systemd sobrevive a reboot) + **MySQL
nativo** em `127.0.0.1:3306` (sem exposição externa, sem limite de conexões por hora — diferente
de hospedagem compartilhada).

## Deploy inicial (já feito)

```bash
git clone https://github.com/andersonsilvasilva/faperfumaria.git /var/www/faperfumaria
cd /var/www/faperfumaria
npm install
# criar .env de produção (ver seção de variáveis abaixo)
npx prisma generate
npx prisma migrate deploy
npm run build
PORT=3001 pm2 start npm --name faperfumaria --cwd /var/www/faperfumaria -- start
pm2 save
```

Nginx (`/etc/nginx/sites-available/faperfumaria`, habilitado via symlink em `sites-enabled/`):
`proxy_pass http://127.0.0.1:3001` para `server_name faperfumaria.com.br www.faperfumaria.com.br`.
SSL emitido com `certbot --nginx -d faperfumaria.com.br -d www.faperfumaria.com.br`.

## Deploy de atualizações

```bash
ssh veloterap-vps
cd /var/www/faperfumaria
git pull
npm install                                          # só se package.json mudou
npx prisma generate && npx prisma migrate deploy      # só se o schema mudou
npm run build
pm2 restart faperfumaria
```

`public/uploads/` é gitignored e nunca é tocado por `git pull` — imagens enviadas via Admin
persistem sozinhas entre deploys, sem precisar reempacotar nada manualmente.

## Variáveis de ambiente em produção

Mesma estrutura do `.env.example`, com estas diferenças do `.env` de desenvolvimento:

- `DATABASE_URL="mysql://faperfumaria:<senha>@127.0.0.1:3306/faperfumaria"` — banco local nesta
  mesma VPS, usuário dedicado (`GRANT ALL` só nesse schema).
- `PORT="3001"` — **atenção**: `next start` só lê essa variável do ambiente real do processo no
  momento em que é iniciado, não de dentro do `.env` sozinho. Por isso o comando de start do PM2
  precisa exportar `PORT=3001` explicitamente (ver acima); só ter `PORT` no `.env` não é
  suficiente. Depois de `pm2 save`, esse valor fica salvo no dump do PM2 e sobrevive a reboot.
- `AUTH_SECRET` — mesmo valor usado desde o primeiro deploy (reaproveitado na migração pra não
  invalidar sessões à toa).
- `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL="https://faperfumaria.com.br"` — sem mudança.
- `PAYMENT_PROVIDER="mock"` — decisão deliberada do cliente, continua igual. Só trocar pra
  `"mercadopago"` mediante pedido explícito.

## Migrations em produção

```bash
npx prisma migrate deploy
```

Essa VPS tem `CREATE DATABASE` liberado (usuário root/administrador do MySQL), então
`prisma migrate dev` funcionaria normalmente aqui se um dia for preciso — mas o fluxo de deploy
usa sempre `migrate deploy`, nunca `migrate dev`, direto no banco de produção.

## Uploads em produção

Gravados direto em disco (`public/uploads/`) via `src/app/api/admin/upload/route.ts` — funciona
sem ressalvas aqui (disco persistente, sem CDN no meio como na Hostinger, sem otimizador de
imagem falhando). A prop `unoptimized` no `next/image` para conteúdo de `/uploads/` continua no
código (era uma correção pra um bug específico da Hostinger) mas não atrapalha em nada nesta VPS.

## Histórico — por que saiu da Hostinger

O primeiro deploy (mesmo dia, mais cedo) foi na Hostinger via "Deploy Web App" (hospedagem
compartilhada). A conta tinha um teto de **500 conexões novas por hora** no MySQL que derrubou o
site em produção várias vezes, mesmo depois de corrigidos bugs reais de código que agravavam o
problema (pool do Prisma duplicado — o cache em `globalThis` só valia fora de produção — e uma
Server Action sem tratamento de erro). Era um limite de conta que não dava pra aumentar via
suporte comum. Migrar pra uma VPS própria com MySQL local elimina esse teto por completo.

Detalhes completos da hospedagem antiga (fluxo do "Deploy Web App", Passenger com `server.js`
customizado, todos os bugs específicos daquele host e como foram corrigidos) ficam só na memória
do Claude Code deste projeto — não repetidos aqui porque não descrevem mais o ambiente real.
`server.js` e o `experimental.cpus: 2` do `next.config.mjs` continuam no repo (inofensivos numa
VPS normal, `server.js` simplesmente não é mais usado como entry point — quem sobe a aplicação
agora é `next start` direto via PM2).
