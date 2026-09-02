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

Provider abstraído (`EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`). Templates: pedido
recebido, pagamento aprovado, pedido em preparação/enviado/entregue, pagamento recusado,
cancelamento, redefinição de senha.

## Analytics

Google Analytics 4 (`NEXT_PUBLIC_GA_ID`) e Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`), carregados
apenas se as variáveis estiverem definidas. Eventos: `view_item`, `view_item_list`, `search`,
`add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_payment_info`, `purchase`,
`add_to_wishlist`. `purchase` só dispara após confirmação real de pagamento — nunca no
redirecionamento do checkout.
