# Deploy

**Status: em produção desde 2026-09-03 em https://faperfumaria.com.br/**

## Ambiente de hospedagem

Hostinger, plano de hospedagem compartilhada (conta `u357370739`). Essa conta hospeda **vários
sites diferentes** do mesmo cliente/agência além da FA Perfumaria — cuidado ao mexer via SSH,
nunca tocar em nada fora de `domains/faperfumaria.com.br/`.

- Banco MySQL/MariaDB acessível remotamente (host, usuário e senha só em `.env`, nunca
  versionados — ver `Dados da Empresa.txt`, no `.gitignore`).
- Acesso SSH por chave (`ssh -p 65002 u357370739@31.170.166.99`).
- **A conta do banco tem um limite de `max_connections_per_hour`** (conexões novas por hora, não
  conexões simultâneas). Ver seção "Limite de conexões" abaixo — é a causa da maior parte da
  instabilidade enfrentada até estabilizar o deploy.

## Como o deploy funciona (recurso "Deploy Web App" do hPanel)

Sites → Add Website → **Deploy Web App → Node.js** → upload de um `.zip` com o código-fonte. A
Hostinger detecta Next.js automaticamente e builda sozinha — **não dá pra customizar o comando de
build pela UI** (só presets tipo "npm run build"), por isso qualquer ajuste de build precisa estar
no próprio `package.json` (ver `"build"` nele: `"prisma generate && next build --webpack"`).

Por baixo dos panos isso roda via **Phusion Passenger**, configurado em
`domains/faperfumaria.com.br/public_html/.htaccess` (gerado automaticamente a cada deploy):

```
PassengerAppRoot .../hbuilds/current/nodejs
PassengerAppType node
PassengerStartupFile server.js
```

Ou seja, **`server.js` na raiz do projeto é o entry point real usado em produção** (não é código
morto de uma tentativa abandonada — é isso que o Passenger executa). Ele cria um servidor HTTP
puro chamando o request handler do Next.js. Contém handlers de `uncaughtException`/
`unhandledRejection` e captura erros por requisição — sem isso, uma exceção não tratada em
qualquer lugar derruba o processo inteiro (fecha todas as conexões em andamento, o navegador
mostra isso como falha de conexão, não como um 500 normal).

Cada deploy cria uma pasta nova em `hbuilds/versions/<uuid>/`, e `hbuilds/current` é um symlink
pra versão ativa. **Atenção**: dentro de cada versão, o código do app fica um nível mais fundo do
que parece — `hbuilds/current/nodejs/...`, não `hbuilds/current/...` diretamente (fácil de
esquecer ao investigar via SSH e achar que um arquivo "sumiu").

## Como gerar e reenviar o zip de deploy

```bash
git archive --format=zip -o caminho/faperfumaria-deploy.zip HEAD
```

**Nunca usar `Compress-Archive` do PowerShell** para o zip base — grava permissões erradas em
pastas que só têm subpastas (sem arquivo direto dentro), e o build falha com `EACCES: permission
denied, scandir '.../src/app/api/admin'`. `git archive` gera permissões corretas.

Depois, adicionar ao zip (ambos gitignored, então `git archive` não pega):

1. **`.env` de produção** — não é o `.env` de desenvolvimento local (que aponta pro MySQL do
   Laragon). Ver seção de variáveis abaixo para montar o de produção.
2. **`public/uploads/*`** — as imagens já enviadas via Admin em produção (baixar antes com
   `scp -r` do servidor, nunca subir as do ambiente local, senão perde uploads reais de
   produção).

Ambos via .NET no PowerShell:

```powershell
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Update')
# remover entry existente antes de recriar, e CreateEntryFromFile pra cada arquivo
$zip.Dispose()
```

Reenviar no hPanel (Deploy Web App → substituir o zip anterior) e clicar em **Reimplantar**.

## Variáveis de ambiente em produção

Mesma estrutura do `.env.example`, com estas diferenças do `.env` de desenvolvimento:

- `DATABASE_URL` — aponta pro MySQL remoto da Hostinger, não pro Laragon local.
- `AUTH_SECRET` — valor próprio de produção, gerado uma vez (nunca reaproveitar o de dev).
- `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` — `https://faperfumaria.com.br`.
- `PAYMENT_PROVIDER="mock"` — decisão deliberada do cliente (loja no ar, mas ainda sem processar
  pagamento real). As credenciais reais do Mercado Pago já estão em `.env` mas ficam inertes
  enquanto o provider for `mock`. Só trocar pra `"mercadopago"` mediante pedido explícito.

O wizard do "Deploy Web App" importa o `.env` incluído no zip (botão "Importar .env" na tela de
variáveis) — não precisa digitar cada variável manualmente ali.

## Migrations em produção

```bash
npx prisma migrate deploy
```

Sem shadow database (ver `docs/database.md`). **Atenção a case-sensitivity**: `ALTER TABLE` com
nome de tabela em minúsculo (`cart` em vez de `Cart`) passa despercebido no MySQL local do
Windows (case-insensitive) mas quebra no MySQL Linux de produção (case-sensitive). Conferir os
nomes de tabela nas migrations antes de rodar `migrate deploy` pela primeira vez num host novo.

## Limite de conexões do banco (`max_connections_per_hour`)

A conta MySQL tem um teto de conexões **novas** por hora (não simultâneas). Dois bugs reais já
mascararam esse limite como se fosse um problema de infraestrutura fora do nosso controle —
**ambos já corrigidos**, mas documentados aqui porque o padrão de sintoma (erro 500 intermitente,
digest diferente a cada vez) volta a acontecer se alguém reintroduzir um bug parecido:

1. **`connectionLimit` nunca era aplicado**: o driver `mariadb` só reconhece essa opção em
   camelCase dentro de um OBJETO de config — um `?connection_limit=N` na connection string é
   ignorado silenciosamente. `src/lib/prisma.ts` parseia a URL manualmente num objeto `PoolConfig`
   com `connectionLimit` explícito.
2. **O cache do `PrismaClient` em `globalThis` só valia fora de produção** — em produção nunca
   era aplicado. Como o Next.js compila rotas/actions em chunks separados, cada chunk que
   importava `@/lib/prisma` pela primeira vez criava seu PRÓPRIO `PrismaClient` (e pool) em vez
   de reaproveitar um único, multiplicando conexões novas sem nenhum reinício de processo
   acontecer. **Esta foi a causa real por trás da maior parte da instabilidade** — o cache agora
   é sempre aplicado, com `connectionLimit: 5` (suficiente com um pool de verdade único).

Além disso, **toda Server Action que faz uma consulta ao banco precisa de try/catch** —  uma
Server Action que lança sem tratamento derruba a página inteira (Next.js propaga pro error
boundary mais próximo), não só aquela ação. Ver `src/modules/shipping/actions.ts` como exemplo do
padrão esperado, e `src/app/(store)/error.tsx` como rede de segurança geral.

Se o limite for atingido mesmo assim (pico real de tráfego, não bug), não tem como aumentar via
suporte comum da Hostinger — só esperar a janela resetar. Vale reabrir chamado se voltar a
acontecer com tráfego real de clientes.

## Build: problemas específicos deste host e como foram resolvidos

- **Turbopack não builda** (glibc antiga, `@next/swc-linux-x64-gnu` falha, cai pro fallback WASM
  que não é suficiente pro build completo) → `package.json` usa `next build --webpack`.
- **`next.config.ts` não carrega** (mesma limitação de SWC/WASM se aplica à transpilação do
  próprio arquivo de config, independente da escolha Turbopack/Webpack) → usar `next.config.mjs`
  (JS puro, sem transpilação).
- **`EAGAIN` ao spawnar workers de build** (Next.js conta CPUs do host físico, não a fração da
  conta) → `experimental.cpus: 2` no `next.config.mjs`.
- **Páginas que consultam o banco não podem ser estáticas/ISR** — rodam durante o `next build`,
  que compete pelo mesmo limite de conexões. `/` e `/sitemap.xml` precisaram de
  `export const dynamic = "force-dynamic"`.

## Uploads em produção

Gravados direto em disco (`public/uploads/`, fora do git) via `src/app/api/admin/upload/route.ts`
— funciona bem aqui porque o disco é persistente entre reinícios do processo (não é serverless).
Precisam ser incluídos manualmente em cada novo zip de deploy (ver seção acima), senão um novo
deploy perde os uploads feitos entre um deploy e outro.

As respostas de `/uploads/...` passam por um CDN da própria Hostinger (`Server: hcdn` no
header). Uma imagem recém-enviada pode aparecer quebrada por uma tentativa ou duas logo após o
upload — é o CDN propagando o arquivo novo a partir da origem, não um bug. Espera um pouco e
recarrega antes de investigar mais fundo.

Imagens que passam por `next/image` (`/_next/image?url=...`) e vêm de `/uploads/` usam a prop
`unoptimized` — o otimizador de imagem do Next.js falhava de forma intermitente pra arquivos
gravados em runtime nesse host (bytes idênticos, ora 200 ora 400 "isn't a valid image").
Servir sem otimização evita essa rota inteira pra conteúdo de upload.

## Pendências conhecidas

- Nada libera a reserva de estoque de um PIX gerado e nunca pago — falta um job de expiração
  (ver `docs/commerce-rules.md`).
- Cartão real via Mercado Pago Bricks não implementado (só PIX real, e mesmo assim inerte
  enquanto `PAYMENT_PROVIDER="mock"`).
