# Integrações externas

Todas as integrações externas seguem o mesmo princípio: **interface abstrata + implementação
real + modo mock explícito** para desenvolvimento sem credenciais (seção 6 do `CLAUDE.md`).

## Pagamento

Implementado em `src/modules/payments/` (`types.ts` define a interface `PaymentProvider`;
`mock-provider.ts` e `mercadopago-provider.ts` são as duas implementações; `index.ts` escolhe
qual usar). `getPaymentProvider()` é a única forma que o resto do app usa para acessar o
provider ativo.

**Padrão de segurança: `PAYMENT_PROVIDER=mock` sempre, mesmo com as credenciais reais do
Mercado Pago presentes em `.env`.** Só processa cobranças de verdade quando alguém troca
`PAYMENT_PROVIDER` para `mercadopago` explicitamente em `.env` — nunca por acidente, nunca em
testes automatizados. As credenciais em `.env` são de **produção real** (prefixo `APP_USR-`),
fornecidas pelo cliente.

- **PIX real**: implementado via SDK oficial (`mercadopago` npm), usando a API de Payments
  (`payment_method_id: "pix"`) — não precisa de tokenização de cartão, só e-mail e valor, então
  é seguro de usar assim que o provider for trocado para `mercadopago`.
- **Cartão real**: a interface existe (`createCardPayment`), mas a captura seria via Mercado
  Pago Bricks (widget deles, tokeniza no navegador) — ainda **não implementada** no checkout.
  Por isso a UI de checkout só mostra a opção "Cartão de crédito" quando o provider ativo é o
  mock; com `mercadopago` ativo, só PIX fica disponível até essa parte ser construída.
- **Webhook** (`src/app/api/webhooks/mercadopago/route.ts`): valida a assinatura
  (`WebhookSignatureValidator` do SDK oficial) antes de processar qualquer notificação — nunca
  confia em payload não assinado. Atualiza `Payment.status` e, se aprovado, marca o pedido como
  `PAID` e registra a movimentação de estoque `SALE`.
- **Simulação em dev**: com o provider mock, a página de confirmação do pedido
  (`/pedido/[orderNumber]`) mostra um botão "[Dev] Simular pagamento aprovado" para testar o
  fluxo de aprovação de PIX sem esperar um webhook real.

## Frete

Implementado em `src/modules/shipping/provider.ts`. Três modos: retirada na loja (grátis),
entrega local (Bombinhas, Porto Belo, Itapema — preço vem de `StoreSetting` com chave
`local_delivery_pricing`, com fallback hardcoded se a config não existir; sem Admin ainda,
ajustar direto no banco) e frete nacional. A cidade do CEP é resolvida via **ViaCEP** (API
pública gratuita, sem chave), e o frete nacional usa uma **estimativa MOCK** (base + peso) —
documentado como tal no código, sem integração real de transportadora ainda.

## E-mail transacional

Implementado em `src/modules/email/` (`types.ts` define a interface `EmailProvider`;
`mock-provider.ts` e `gmail-provider.ts` são as duas implementações; `index.ts`/
`getEmailProvider()` escolhe qual usar, mesmo padrão do módulo de pagamento). Templates HTML +
texto puro em `templates.ts` para os 8 tipos exigidos pela seção 53 do `CLAUDE.md`: pedido
recebido, pagamento aprovado, pedido em preparação/enviado/entregue, pagamento recusado,
cancelamento e redefinição de senha. `send-order-email.ts` busca os dados do pedido no banco e
despacha o template certo — nunca lança erro para quem chamou (falha de e-mail não pode
derrubar um checkout ou um webhook, só fica registrada no console).

**Padrão de segurança: `EMAIL_PROVIDER=mock` sempre por padrão.** Só envia e-mails de verdade
quando `EMAIL_PROVIDER=gmail` é definido explicitamente e as 4 variáveis abaixo estão
preenchidas — do contrário `getEmailProvider()` lança erro na inicialização, nunca envia "quase
certo".

Disparos já ligados aos fluxos reais:

- `pedido recebido` — ao criar o pedido (`createOrderAction`, antes de tentar o pagamento).
- `pagamento aprovado` — cartão aprovado na hora, simulação de PIX em dev
  (`simulatePixApprovalAction`) e webhook do Mercado Pago quando o pagamento é confirmado.
- `pagamento recusado` / `cancelamento` — webhook do Mercado Pago quando a notificação chega
  como `REJECTED`/`CANCELLED`; a reserva de estoque é liberada (`InventoryMovementType.RELEASE`)
  no mesmo passo.
- `pedido em preparação` / `enviado` / `entregue` — templates prontos em `templates.ts`
  (`orderPreparingEmail`, `orderShippedEmail`, `orderDeliveredEmail`); ainda sem um trigger real
  porque a gestão de status de pedido pelo admin (Fase 5) não existe — a action que a Fase 5 for
  criar para mudar o status do pedido só precisa chamar `sendOrderEmail(orderId, "PREPARING" |
  "SHIPPED" | "DELIVERED")`.
- `redefinição de senha` — template pronto (`passwordResetEmail`); ainda sem um fluxo de "esqueci
  minha senha" no app (login é só credenciais hoje).

### Gmail API — como gerar as credenciais (`EMAIL_PROVIDER=gmail`)

Segue o guia oficial:
https://developers.google.com/workspace/gmail/api/guides/sending?hl=pt-br

A API do Gmail não aceita usuário/senha nem uma chave de API simples — só OAuth2. Isso exige um
passo manual, feito uma única vez, com login na conta Gmail/Workspace que vai enviar os
e-mails (esse login não pode ser feito por automação, só pelo dono da conta):

1. No [Google Cloud Console](https://console.cloud.google.com/), crie ou selecione um projeto e
   ative a **Gmail API** (menu "APIs e serviços" → "Biblioteca").
2. Configure a **tela de consentimento OAuth** ("APIs e serviços" → "Tela de consentimento"),
   adicionando o escopo `https://www.googleapis.com/auth/gmail.send`.
3. Crie uma credencial **OAuth 2.0 Client ID** do tipo "Aplicativo para computador" — isso gera
   `GMAIL_CLIENT_ID` e `GMAIL_CLIENT_SECRET`.
4. Gere o `GMAIL_REFRESH_TOKEN` autorizando o escopo `gmail.send` com a conta Gmail que vai
   enviar os e-mails. O jeito mais rápido é pelo
   [OAuth 2.0 Playground](https://developers.google.com/oauthplayground): no ícone de
   engrenagem, marque "Use your own OAuth credentials" e informe o Client ID/Secret do passo 3;
   na lista de escopos, informe manualmente `https://www.googleapis.com/auth/gmail.send`;
   autorize com a conta Gmail desejada; na etapa 2, clique em "Exchange authorization code for
   tokens" e copie o `refresh_token` retornado.
5. Preencha em `.env`: `EMAIL_PROVIDER="gmail"`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`,
   `GMAIL_REFRESH_TOKEN` e `EMAIL_FROM` (ex.: `"FA Perfumaria <contato@faperfumaria.com.br>"`).

**Atenção ao `EMAIL_FROM`**: o Gmail só aceita enviar como um endereço que seja a própria conta
autenticada ou um alias verificado em "Enviar e-mail como" (configurações da conta Gmail); um
`EMAIL_FROM` com domínio próprio (`@faperfumaria.com.br`) só funciona se esse endereço estiver
cadastrado e verificado como alias na conta Gmail usada para gerar o refresh token — caso
contrário o Gmail substitui pelo endereço real da conta autenticada.

Limite de envio do Gmail API: 500 e-mails/dia em conta Gmail comum (mais alto em contas Google
Workspace) — suficiente para o volume transacional de uma loja deste porte.

## Analytics

Google Analytics 4 (`NEXT_PUBLIC_GA_ID`) e Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`), carregados
apenas se as variáveis estiverem definidas. Eventos: `view_item`, `view_item_list`, `search`,
`add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_payment_info`, `purchase`,
`add_to_wishlist`. `purchase` só dispara após confirmação real de pagamento — nunca no
redirecionamento do checkout.
