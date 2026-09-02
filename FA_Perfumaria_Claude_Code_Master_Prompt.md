# PROMPT MESTRE — CLAUDE CODE
## Projeto: FA Perfumaria — E-commerce Premium

Você é o arquiteto de software e desenvolvedor principal responsável por criar um e-commerce completo, moderno, responsivo e comercialmente utilizável para a empresa **FA Perfumaria**, localizada em Bombinhas/SC.

O objetivo não é criar apenas um site institucional. Deve ser construído um **e-commerce real**, com catálogo, busca, filtros, carrinho, checkout, pagamentos, frete, estoque, pedidos, área do cliente e painel administrativo.

---

# 1. DADOS DA EMPRESA

**Nome:** FA Perfumaria  
**E-mail:** Elielaraujo852@outlook.com  
**WhatsApp/Telefone:** +55 (47) 98836-0043  
**Endereço:** R. Maracujá, 72 - Sertãozinho, Bombinhas - SC, 88215-000, Brasil  

**Instagram:** https://www.instagram.com/elielaraujooficial/  
**Facebook:** https://www.facebook.com/eliel.araujo.505569  
**Threads:** https://www.threads.com/@elielaraujooficial  

---

# 2. POSICIONAMENTO DA MARCA

A FA Perfumaria deve transmitir:

- luxo discreto;
- elegância;
- sofisticação;
- confiança;
- acolhimento;
- curadoria premium;
- experiência personalizada.

A experiência digital deve lembrar uma boutique de perfumaria sofisticada, evitando excesso de elementos, cores saturadas ou layouts genéricos de marketplace.

Conceito central:

> **Perfume é memória. Presença. Identidade.**

Tagline principal sugerida:

> **Sua presença começa pela essência.**

---

# 3. IDENTIDADE VISUAL

## Paleta principal

- Preto Premium: `#0B0B0B`
- Dourado Principal: `#C99724`
- Dourado Suave: `#DDB95E`
- Off White: `#F8F6F1`
- Branco: `#FFFFFF`

## Paleta de apoio

- Madeira Média: `#907F64`
- Madeira Escura: `#685A51`
- Bege Natural: `#CDC5B4`
- Areia Suave: `#DAD3C0`
- Mármore Cinza: `#BAB7AF`
- Cinza Pedra: `#9D9C94`

## Tipografia

Preferência:

- Títulos: `Playfair Display`
- Interface/textos: `Inter`

Alternativas aceitáveis:

- Cormorant Garamond
- Cinzel
- Montserrat
- Manrope

## Regras visuais

- muito espaço em branco;
- grid organizado;
- bordas discretas;
- sombras suaves;
- dourado usado como detalhe, não como excesso;
- fundos off-white e branco;
- preto em áreas premium;
- madeira e mármore apenas como textura de apoio;
- animações sutis;
- sem efeitos chamativos;
- cards de produto claros e sofisticados.

---

# 4. ASSETS DA MARCA

O projeto receberá os seguintes assets fornecidos pelo cliente:

- logomarca oficial FA Perfumaria;
- foto da vitrine/estante de perfumes;
- textura ripada de madeira;
- textura de mármore claro.

Organize os arquivos em:

```text
/public/brand/logo-fa-perfumaria.jpg
/public/brand/store-perfumes.jpg
/public/brand/texture-wood.jpg
/public/brand/texture-marble.jpg
```

Nunca altere a proporção da logomarca.

Crie também suporte para versões futuras:

```text
/public/brand/logo-fa-horizontal.svg
/public/brand/logo-fa-symbol.svg
```

Caso esses SVGs ainda não existam, apenas deixe a estrutura preparada.

---

# 5. STACK TÉCNICA

Usar:

- Next.js atual com App Router;
- React;
- TypeScript;
- Tailwind CSS;
- MySQL;
- Prisma ORM;
- Zod;
- React Hook Form;
- autenticação segura com Auth.js ou solução equivalente;
- Server Components quando apropriado;
- Server Actions/API Routes apenas quando necessário.

Arquitetura:

> **Monólito modular moderno**

Não criar microserviços nesta fase.

---

# 6. REQUISITOS DE ENGENHARIA

O código deve:

- ser fortemente tipado;
- seguir Clean Code;
- evitar duplicação;
- separar regras de negócio de UI;
- utilizar componentes reutilizáveis;
- utilizar services/repositories quando fizer sentido;
- possuir validação server-side;
- possuir tratamento de erros;
- possuir loading states;
- possuir empty states;
- possuir feedback visual para ações do usuário;
- ser responsivo;
- atender boas práticas de acessibilidade;
- ser SEO friendly;
- estar preparado para produção.

Não deixar TODOs críticos escondidos.

Quando uma integração externa ainda não tiver credenciais, construir o adapter e fornecer modo mock/dev claramente identificado.

---

# 7. ESTRUTURA PRINCIPAL DA APLICAÇÃO

Criar quatro áreas:

```text
FA PERFUMARIA
│
├── Storefront
│   ├── Home
│   ├── Loja
│   ├── Busca
│   ├── Categorias
│   ├── Marcas
│   └── Produto
│
├── Commerce
│   ├── Carrinho
│   ├── Checkout
│   ├── Pagamento
│   ├── Frete
│   ├── Cupons
│   └── Pedidos
│
├── Cliente
│   ├── Minha Conta
│   ├── Pedidos
│   ├── Favoritos
│   └── Endereços
│
└── Admin
    ├── Dashboard
    ├── Produtos
    ├── Categorias
    ├── Marcas
    ├── Estoque
    ├── Pedidos
    ├── Clientes
    ├── Cupons
    ├── Banners
    └── Configurações
```

---

# 8. ROTAS

Criar inicialmente:

```text
/
 /loja
 /masculinos
 /femininos
 /unissex
 /arabes
 /decants
 /kits
 /ofertas

 /produto/[slug]
 /marca/[slug]
 /buscar

 /carrinho
 /checkout
 /pedido/[orderNumber]

 /minha-conta
 /minha-conta/pedidos
 /minha-conta/pedidos/[id]
 /minha-conta/favoritos
 /minha-conta/enderecos
 /minha-conta/perfil

 /sobre
 /contato

 /politica-de-privacidade
 /politica-de-cookies
 /trocas-e-devolucoes
 /entregas
 /termos-de-uso

 /admin
 /admin/produtos
 /admin/produtos/novo
 /admin/produtos/[id]
 /admin/pedidos
 /admin/pedidos/[id]
 /admin/estoque
 /admin/clientes
 /admin/cupons
 /admin/banners
 /admin/configuracoes
```

---

# 9. HEADER

Desktop:

- logo;
- menu;
- busca;
- favoritos;
- conta;
- carrinho.

Menu:

- Início
- Perfumes
- Masculinos
- Femininos
- Árabes
- Decants
- Kits & Presentes
- Ofertas
- Sobre a FA

Criar mega menu em `Perfumes`:

### Por público
- Masculinos
- Femininos
- Unissex

### Por estilo
- Árabes
- Importados
- Decants
- Kits

### Por ocasião
- Dia a dia
- Trabalho
- Encontros
- Noite
- Festas
- Presentes

Mobile:

- drawer lateral;
- navegação simples;
- busca facilmente acessível;
- carrinho visível.

Header sticky com comportamento discreto.

---

# 10. HOME — ORDEM DAS SEÇÕES

A Home deve seguir esta ordem:

1. Barra institucional
2. Header
3. Hero principal
4. Benefícios rápidos
5. Categorias
6. Produtos em destaque
7. Banner Perfumes Árabes
8. Mais vendidos
9. Descubra sua Essência
10. Kits & Presentes
11. Sobre a FA
12. Atendimento via WhatsApp
13. Instagram/social
14. Newsletter
15. Rodapé

---

# 11. CONTEÚDO TEXTUAL DA HOME

## Barra superior

> **Envios para todo o Brasil • Atendimento personalizado pelo WhatsApp**

---

## HERO

Eyebrow:

> **FA PERFUMARIA**

Título:

> **Sua presença começa pela essência.**

Texto:

> Fragrâncias escolhidas para quem entende que um perfume vai além do aroma. Ele revela personalidade, marca momentos e deixa uma impressão que permanece.

CTA principal:

> **EXPLORAR PERFUMES**

CTA secundário:

> **ENCONTRAR MINHA FRAGRÂNCIA**

Visual:

- layout editorial;
- texto à esquerda;
- imagem premium à direita;
- off-white;
- pequenos detalhes dourados;
- possibilidade de textura de mármore extremamente sutil.

---

# 12. BENEFÍCIOS

Criar quatro cards/itens:

### Curadoria especial
> Perfumes escolhidos para diferentes estilos, momentos e personalidades.

### Atendimento personalizado
> Conte com a FA para encontrar uma fragrância que realmente combine com você.

### Compra fácil e segura
> Uma experiência simples, transparente e pensada para sua tranquilidade.

### Entrega com cuidado
> Seu pedido preparado com atenção desde a escolha até o envio.

---

# 13. CATEGORIAS

Título:

> **Encontre a fragrância para o seu momento**

Texto:

> Explore nossa seleção e descubra perfumes capazes de traduzir diferentes estilos, personalidades e ocasiões.

Cards:

### Perfumes Masculinos
> Presença, elegância e personalidade em fragrâncias que deixam sua marca.

### Perfumes Femininos
> Fragrâncias delicadas, sofisticadas, intensas e envolventes para diferentes momentos.

### Perfumes Árabes
> Composições intensas e marcantes para quem busca fragrâncias com personalidade.

### Decants
> Experimente novas fragrâncias em pequenas quantidades antes de escolher seu próximo perfume.

### Kits & Presentes
> Escolhas especiais para transformar fragrâncias em experiências memoráveis.

### Ofertas
> Condições especiais em fragrâncias selecionadas.

---

# 14. PRODUTOS EM DESTAQUE

Eyebrow:

> **SELEÇÃO FA**

Título:

> **Perfumes em destaque**

Texto:

> Uma seleção especial de fragrâncias que merecem espaço na sua coleção.

Mostrar 4 produtos no desktop e adaptar responsivamente.

Card:

- imagem;
- marca;
- nome;
- volume;
- preço;
- preço promocional;
- parcelamento;
- wishlist;
- botão adicionar ao carrinho;
- quick view opcional.

---

# 15. PERFUMES ÁRABES

Eyebrow:

> **INTENSIDADE & SOFISTICAÇÃO**

Título:

> **O universo da perfumaria árabe**

Texto:

> Fragrâncias intensas, envolventes e cheias de personalidade. Descubra composições que combinam tradição, riqueza olfativa e uma presença difícil de esquecer.

CTA:

> **CONHECER PERFUMES ÁRABES**

Design:

- fundo preto;
- elementos dourados;
- fotografia premium;
- contraste elevado;
- sem aparência excessivamente ornamental.

---

# 16. MAIS VENDIDOS

Eyebrow:

> **ESCOLHAS DOS CLIENTES**

Título:

> **Os queridinhos da FA**

Texto:

> Perfumes que conquistam pela fragrância, personalidade e presença.

CTA:

> **VER MAIS VENDIDOS**

Usar ranking real derivado das vendas assim que houver dados.

No ambiente de desenvolvimento usar dados seed.

---

# 17. DESCUBRA SUA ESSÊNCIA

Criar uma seção de alto destaque.

Título:

> **Qual perfume combina com você?**

Texto:

> Cítrico ou amadeirado? Suave ou marcante? Para o trabalho, para um encontro ou para aquela ocasião especial? Encontrar um perfume fica muito mais fácil quando você conhece o seu perfil.

CTA:

> **DESCOBRIR MEU PERFIL OLFATIVO**

No MVP, o botão pode abrir uma página interna com quiz.

---

# 18. QUIZ "DESCUBRA SUA ESSÊNCIA"

Criar rota:

```text
/descubra-sua-essencia
```

Perguntas:

## 1. Para quem é a fragrância?
- Masculino
- Feminino
- Unissex

## 2. Que presença deseja transmitir?
- Elegante
- Sedutora
- Fresca
- Marcante
- Sofisticada
- Discreta

## 3. Quando pretende usar?
- Dia a dia
- Trabalho
- Encontros
- Festas
- Noite

## 4. Qual intensidade prefere?
- Suave
- Moderada
- Marcante
- Muito intensa

## 5. Quanto pretende investir?
- Até R$150
- R$150–300
- R$300–500
- Acima de R$500

Resultado:

- retornar 3 a 6 perfumes;
- mostrar percentual de compatibilidade;
- explicar brevemente a recomendação.

Exemplo:

> **94% compatível**

> Recomendamos esta fragrância por seu perfil amadeirado, marcante e sofisticado, especialmente indicado para noite e ocasiões especiais.

Implementar inicialmente com algoritmo de scoring baseado em tags, sem depender de IA externa.

---

# 19. KITS & PRESENTES

Eyebrow:

> **PRESENTEAR TAMBÉM É CRIAR MEMÓRIAS**

Título:

> **Um presente que permanece.**

Texto:

> Existem presentes que são lembrados pelo momento. Outros, pelo aroma. Encontre fragrâncias e combinações especiais para transformar sua escolha em uma experiência.

CTA:

> **VER KITS & PRESENTES**

---

# 20. SOBRE A FA

Título:

> **Perfume é memória. Presença. Identidade.**

Texto:

> Na FA Perfumaria, acreditamos que escolher uma fragrância é também escolher como queremos ser lembrados.
>
> Por isso, buscamos oferecer uma seleção de perfumes para diferentes estilos, ocasiões e personalidades, unindo atendimento próximo a uma experiência de compra simples e elegante.
>
> Mais do que apresentar fragrâncias, queremos ajudar você a encontrar aquela que traduz a sua essência.

CTA:

> **CONHEÇA A FA PERFUMARIA**

---

# 21. WHATSAPP

Eyebrow:

> **FALE COM A FA**

Título:

> **Ainda não sabe qual perfume escolher?**

Texto:

> Conte para nós o estilo de fragrância que você gosta, a ocasião ou até mesmo um perfume que já usa. Podemos ajudar você a encontrar novas opções.

CTA:

> **FALAR PELO WHATSAPP**

Usar:

```text
https://wa.me/5547988360043
```

Criar mensagens pré-preenchidas contextualizadas para produtos.

Exemplo:

> Olá! Tenho interesse no [NOME DO PRODUTO] da FA Perfumaria.

---

# 22. INSTAGRAM

Título:

> **Inspire-se com a FA**

Texto:

> Novidades, fragrâncias, sugestões e escolhas especiais para quem é apaixonado pelo universo da perfumaria.

Exibir:

> **@elielaraujooficial**

CTA:

> **SEGUIR NO INSTAGRAM**

Inicialmente usar cards/banners controlados pelo Admin.

Não depender obrigatoriamente de API do Instagram para o MVP.

---

# 23. NEWSLETTER

Título:

> **Entre para o universo FA**

Texto:

> Receba novidades, lançamentos, seleções especiais e condições exclusivas diretamente no seu e-mail.

Campo:

> Seu melhor e-mail

Botão:

> **QUERO RECEBER**

Consentimento:

> Concordo em receber comunicações da FA Perfumaria e posso cancelar minha inscrição a qualquer momento.

Salvar consentimento e timestamp.

---

# 24. RODAPÉ

Descrição:

> **Fragrâncias escolhidas para transformar essência em presença.**

Colunas:

### Loja
- Masculinos
- Femininos
- Árabes
- Decants
- Kits & Presentes
- Ofertas

### Atendimento
- Fale conosco
- Minha conta
- Meus pedidos
- Trocas e devoluções
- Envios e entregas

### Institucional
- Sobre a FA
- Política de Privacidade
- Política de Cookies
- Termos de Uso

### Contato

FA Perfumaria  
R. Maracujá, 72  
Sertãozinho — Bombinhas/SC  
CEP 88215-000  

WhatsApp: +55 (47) 98836-0043  
E-mail: Elielaraujo852@outlook.com

Redes sociais:
- Instagram
- Facebook
- Threads

---

# 25. CATÁLOGO

Página `/loja`.

Criar:

- título;
- breadcrumb;
- ordenação;
- filtros;
- grid;
- paginação ou infinite load bem controlado;
- estado vazio;
- skeleton loading.

Ordenações:

- Relevância
- Mais vendidos
- Novidades
- Menor preço
- Maior preço
- Melhor avaliados

Filtros:

### Categoria
- Masculino
- Feminino
- Unissex
- Árabe
- Decant
- Kit

### Marca

Dinâmico.

### Preço
- Até R$150
- R$150–300
- R$300–500
- Acima de R$500

### Família olfativa
- Amadeirado
- Oriental
- Floral
- Cítrico
- Aromático
- Gourmand
- Frutado
- Especiado
- Aquático

### Ocasião
- Dia a dia
- Trabalho
- Encontro
- Festa
- Noite
- Presente

### Intensidade
- Suave
- Moderada
- Marcante
- Intensa

Filtros devem ser refletidos na URL quando possível.

---

# 26. BUSCA

Criar busca tolerante a pequenas variações.

Pesquisar em:

- nome;
- marca;
- categoria;
- família olfativa;
- tags;
- notas;
- perfil.

Exemplos que devem funcionar:

```text
club nuit
armaf
perfume masculino doce
perfume noite
amadeirado
```

Implementar busca inicial em MySQL/Prisma com normalização.

Preparar camada para mecanismo especializado no futuro.

---

# 27. PÁGINA DE PRODUTO

Layout desktop:

```text
[ GALERIA ]       [ INFORMAÇÕES ]
[           ]     Nome
[           ]     Marca
[           ]     Avaliação
                  Preço
                  Parcelamento
                  Variante
                  Estoque
                  Quantidade
                  Comprar
                  Carrinho
                  Favoritos
```

Após bloco principal:

1. Sobre esta fragrância
2. Pirâmide olfativa
3. Perfil
4. Quando usar
5. Informações técnicas
6. Avaliações
7. Produtos relacionados

Dados específicos:

- família olfativa;
- notas de saída;
- notas de coração;
- notas de fundo;
- intensidade;
- fixação;
- projeção;
- ocasiões;
- estações;
- perfil;
- concentração;
- volume.

---

# 28. CARRINHO

Itens:

- imagem;
- nome;
- variante;
- quantidade;
- preço;
- subtotal;
- remover.

Recursos:

- alterar quantidade;
- cupom;
- cálculo de frete;
- retirada local;
- resumo financeiro.

Resumo:

```text
Subtotal
Desconto
Frete
Total
```

CTA:

> **FINALIZAR COMPRA**

Carrinho deve funcionar para visitante.

Persistência:

- cookie/session;
- migrar para conta após login quando possível.

---

# 29. CHECKOUT

Construir checkout de uma página.

Seções:

## Contato
- nome;
- CPF;
- e-mail;
- WhatsApp.

## Entrega
- CEP;
- endereço;
- número;
- complemento;
- bairro;
- cidade;
- UF.

## Frete
- transportadora;
- entrega local;
- retirada na loja.

## Pagamento
- PIX;
- cartão.

## Resumo
- produtos;
- desconto;
- frete;
- total.

CTA:

> **FINALIZAR COMPRA**

Não obrigar login antes da compra.

Após finalizar, oferecer criação de conta/senha.

---

# 30. PAGAMENTOS

Criar arquitetura de provider.

Interface sugerida:

```ts
interface PaymentProvider {
  createPixPayment(...)
  createCardPayment(...)
  getPaymentStatus(...)
  refundPayment(...)
}
```

Implementação principal:

> Mercado Pago

Configurar via `.env`.

Nunca armazenar dados sensíveis de cartão.

Em desenvolvimento, disponibilizar provider mock.

---

# 31. FRETE

Criar provider abstrato.

Suportar:

1. retirada na loja;
2. entrega local;
3. frete nacional via provider externo.

Retirada:

> **FA Perfumaria — R. Maracujá, 72, Sertãozinho, Bombinhas/SC**

Valor:

> **Grátis**

Criar configuração no Admin para regiões de entrega local:

- Bombinhas;
- Porto Belo;
- Itapema.

Não codificar preços fixos diretamente na UI.

---

# 32. STATUS DE PEDIDO

Usar enum:

```text
PENDING_PAYMENT
PAID
PREPARING
SHIPPED
DELIVERED
CANCELLED
PAYMENT_FAILED
REFUNDED
```

Mostrar ao cliente em linguagem amigável.

---

# 33. NÚMERO DO PEDIDO

Criar código legível:

```text
FA-2026-000001
FA-2026-000002
```

Não usar ID sequencial puro como número público.

---

# 34. ESTOQUE

Requisitos:

- quantidade disponível;
- estoque mínimo;
- alertas;
- histórico de movimentação;
- variantes independentes.

Tipos de movimentação:

```text
PURCHASE_ENTRY
SALE
CANCELLATION
RETURN
ADJUSTMENT
RESERVATION
RELEASE
```

Fluxo:

```text
Carrinho
→ não altera estoque

Pedido
→ reserva temporária

Pagamento aprovado
→ confirma saída

Pagamento expirado/cancelado
→ libera reserva
```

Evitar overselling.

---

# 35. CUPONS

Campos:

- código;
- tipo percentual/valor;
- valor;
- pedido mínimo;
- início;
- validade;
- quantidade total;
- quantidade por cliente;
- produtos;
- categorias;
- ativo.

Exemplo:

```text
BEMVINDO10
10% OFF
Pedido mínimo: R$200
```

Validar no servidor.

---

# 36. FAVORITOS

Usuário autenticado pode salvar produtos.

Criar botão coração em:

- card;
- produto;
- resultados.

Página:

```text
/minha-conta/favoritos
```

---

# 37. AVALIAÇÕES

Somente clientes com compra confirmada podem receber selo:

> **Compra verificada**

Campos:

- nota 1–5;
- comentário;
- status de moderação;
- data.

Admin pode ocultar spam/conteúdo impróprio, mas não alterar texto do cliente silenciosamente.

---

# 38. ÁREA DO CLIENTE

Dashboard:

- pedidos recentes;
- favoritos;
- dados;
- endereços;
- segurança.

Criar:

```text
/minha-conta
/minha-conta/pedidos
/minha-conta/favoritos
/minha-conta/enderecos
/minha-conta/perfil
```

Permitir:

- acompanhar pedido;
- comprar novamente;
- editar endereço;
- atualizar perfil;
- alterar senha.

---

# 39. PAINEL ADMINISTRATIVO

Sidebar:

- Dashboard
- Produtos
- Categorias
- Marcas
- Pedidos
- Estoque
- Clientes
- Cupons
- Banners
- Newsletter
- Configurações

---

# 40. DASHBOARD ADMIN

Cards:

- vendas hoje;
- faturamento;
- pedidos;
- ticket médio;
- produtos vendidos;
- novos clientes;
- produtos com estoque baixo.

Gráficos:

- vendas últimos 30 dias;
- faturamento por período;
- produtos mais vendidos;
- vendas por categoria.

Não fabricar dados em produção.

Seeds somente em desenvolvimento.

---

# 41. PRODUTOS NO ADMIN

Criar abas:

## Informações
- nome;
- slug;
- marca;
- categorias;
- descrição curta;
- descrição longa.

## Preço
- custo;
- preço;
- preço promocional;
- início/fim da promoção.

## Variantes
- volume;
- SKU;
- código de barras;
- preço;
- estoque;
- peso;
- dimensões.

## Fragrância
- família olfativa;
- saída;
- coração;
- fundo;
- intensidade;
- fixação;
- projeção;
- ocasiões;
- estações;
- personalidade.

## Imagens
- upload;
- ordenação;
- imagem principal;
- alt text.

## SEO
- title;
- meta description;
- canonical opcional.

---

# 42. BANNERS

Admin deve controlar:

- desktop image;
- mobile image;
- eyebrow;
- título;
- subtítulo;
- CTA;
- URL;
- ordem;
- ativo/inativo;
- data de início/fim.

Não codificar banners comerciais diretamente.

---

# 43. GESTÃO DA HOME

Permitir selecionar:

- produtos em destaque;
- coleção árabe;
- kits;
- banners;
- seções ativas;
- ordem básica quando possível.

---

# 44. MODELAGEM PRISMA

Criar entidades equivalentes a:

```text
User
Address

Product
ProductVariant
ProductImage

Brand
Category
ProductCategory

OlfactoryFamily
FragranceNote
ProductFragranceNote
FragranceProfileTag
ProductProfileTag

InventoryMovement

Cart
CartItem

Order
OrderItem

Payment
Shipment

Coupon
CouponUsage

Favorite
Review

Banner
NewsletterSubscriber

StoreSetting
AdminAuditLog
```

Definir corretamente:

- índices;
- unicidade;
- foreign keys;
- cascades;
- timestamps;
- soft delete onde realmente necessário.

Usar `Decimal` para valores monetários.

Nunca usar float para dinheiro.

---

# 45. ROLES

MVP:

```text
CUSTOMER
ADMIN
```

Preparar arquitetura para:

```text
OPERATOR
MARKETING
```

no futuro.

Admin routes devem ser protegidas server-side.

---

# 46. SEGURANÇA

Implementar:

- HTTPS-ready;
- hash seguro de senha;
- sessões seguras;
- CSRF quando aplicável;
- rate limiting nas APIs críticas;
- validação Zod;
- sanitização;
- autorização server-side;
- logs administrativos;
- proteção contra manipulação de preço;
- cálculo de total no servidor;
- proteção contra alteração de estoque pelo cliente;
- webhooks validados;
- secrets exclusivamente em `.env`.

Nunca confiar em valores enviados pelo frontend para preço, desconto ou estoque.

---

# 47. LGPD

Criar páginas e fluxos básicos para:

- Política de Privacidade;
- Política de Cookies;
- Termos de Uso;
- Trocas e Devoluções;
- Política de Entrega.

Consentimentos:

```text
[obrigatório] Li e aceito os termos aplicáveis.
[opcional] Quero receber novidades e ofertas.
```

Marketing nunca deve ser obrigatório para comprar.

Salvar:

- timestamp;
- versão do termo;
- origem;
- finalidade.

---

# 48. SEO

Implementar:

- metadata Next.js;
- title dinâmico;
- descriptions;
- Open Graph;
- Twitter cards;
- sitemap;
- robots;
- canonical;
- breadcrumbs;
- Schema.org.

Schemas principais:

- Organization;
- WebSite;
- BreadcrumbList;
- Product;
- Offer;
- AggregateRating quando houver avaliações reais.

Exemplo:

```text
/produto/club-de-nuit-urban-elixir
```

Title:

> Club de Nuit Urban Elixir | FA Perfumaria

---

# 49. PERFORMANCE

Priorizar Core Web Vitals.

Usar:

- `next/image`;
- imagens WebP/AVIF;
- lazy loading;
- Server Components;
- cache quando apropriado;
- fontes otimizadas;
- evitar JS desnecessário;
- skeletons;
- code splitting.

---

# 50. RESPONSIVIDADE

Priorizar:

- desktop;
- tablet;
- mobile.

Mobile não deve ser versão reduzida mal adaptada.

Especial atenção:

- menu;
- filtros;
- galeria;
- carrinho;
- checkout;
- Admin responsivo pelo menos para tarefas básicas.

---

# 51. ACESSIBILIDADE

Garantir:

- contraste adequado;
- foco visível;
- labels;
- navegação via teclado;
- alt text;
- `aria-*` quando necessário;
- headings semânticos;
- botões com nomes acessíveis.

---

# 52. ANALYTICS

Preparar integrações configuráveis para:

- Google Analytics 4;
- Meta Pixel.

Eventos:

```text
view_item
view_item_list
search
add_to_cart
remove_from_cart
begin_checkout
add_payment_info
purchase
add_to_wishlist
```

Não disparar `purchase` antes de confirmação real.

---

# 53. E-MAILS TRANSACIONAIS

Criar templates para:

- pedido recebido;
- pagamento aprovado;
- pedido em preparação;
- pedido enviado;
- pedido entregue;
- pagamento recusado;
- cancelamento;
- redefinição de senha.

Provider deve ser abstraído.

---

# 54. SEED DE DESENVOLVIMENTO

Criar dados fictícios claramente identificados para desenvolvimento:

- marcas;
- categorias;
- aproximadamente 12 produtos;
- variantes;
- notas;
- usuários;
- pedidos;
- banners.

Nunca misturar seed com produção.

Use produtos genéricos ou itens de exemplo sem afirmar especificações não verificadas.

---

# 55. DESIGN SYSTEM

Criar tokens centralizados.

Exemplo:

```css
--fa-black: #0B0B0B;
--fa-gold: #C99724;
--fa-gold-light: #DDB95E;
--fa-off-white: #F8F6F1;
--fa-white: #FFFFFF;
--fa-wood: #907F64;
--fa-wood-dark: #685A51;
--fa-beige: #CDC5B4;
--fa-sand: #DAD3C0;
--fa-marble: #BAB7AF;
--fa-stone: #9D9C94;
```

Componentes:

- Button
- Input
- Select
- Checkbox
- Radio
- Badge
- ProductCard
- Price
- Rating
- Breadcrumb
- Drawer
- Modal
- Sheet
- Pagination
- EmptyState
- LoadingSkeleton
- Toast
- QuantitySelector
- CartItem
- OrderStatusBadge
- FilterGroup

---

# 56. ESTRUTURA DE DIRETÓRIOS

Organize aproximadamente como:

```text
src/
├── app/
│   ├── (store)/
│   ├── (account)/
│   ├── admin/
│   ├── api/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── store/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   └── admin/
│
├── modules/
│   ├── auth/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   ├── shipping/
│   ├── inventory/
│   ├── coupons/
│   └── customers/
│
├── lib/
├── services/
├── repositories/
├── schemas/
├── types/
└── styles/

prisma/
├── schema.prisma
└── seed.ts

public/
└── brand/
```

Ajuste conforme necessário, preservando modularidade.

---

# 57. VARIÁVEIS DE AMBIENTE

Criar `.env.example`.

Exemplo:

```text
DATABASE_URL=

AUTH_SECRET=
NEXTAUTH_URL=

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_WEBHOOK_SECRET=

SHIPPING_PROVIDER=
SHIPPING_API_TOKEN=

EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=

NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

Nunca versionar `.env`.

---

# 58. TESTES

Implementar testes principalmente nas regras críticas:

- cálculo de preço;
- cupom;
- estoque;
- pedido;
- checkout;
- status;
- recomendação do quiz.

Usar testes unitários e integração onde fizer sentido.

---

# 59. FASES DE IMPLEMENTAÇÃO

Não tentar implementar tudo aleatoriamente.

## FASE 0 — Auditoria
1. verificar repositório atual;
2. identificar stack existente;
3. não sobrescrever código válido;
4. listar riscos;
5. criar plano.

## FASE 1 — Fundação
1. Next.js/TypeScript;
2. Tailwind;
3. design tokens;
4. Prisma/MySQL;
5. autenticação;
6. layout;
7. assets;
8. componentes básicos.

## FASE 2 — Storefront
1. Home;
2. categorias;
3. catálogo;
4. filtros;
5. busca;
6. produto.

## FASE 3 — Commerce
1. carrinho;
2. cupom;
3. estoque;
4. checkout;
5. frete;
6. pagamento;
7. pedidos.

## FASE 4 — Cliente
1. conta;
2. pedidos;
3. favoritos;
4. endereços;
5. avaliações.

## FASE 5 — Admin
1. dashboard;
2. produtos;
3. estoque;
4. pedidos;
5. clientes;
6. cupons;
7. banners;
8. configurações.

## FASE 6 — Conversão
1. Descubra sua Essência;
2. newsletter;
3. analytics;
4. SEO avançado;
5. social.

## FASE 7 — QA
1. responsividade;
2. acessibilidade;
3. performance;
4. segurança;
5. testes;
6. lint;
7. build;
8. correções.

---

# 60. REGRA DE EXECUÇÃO PARA O CLAUDE CODE

Antes de modificar qualquer arquivo:

1. inspecione o repositório;
2. leia `package.json`;
3. leia configurações;
4. verifique estrutura;
5. identifique dependências existentes;
6. reutilize o que estiver correto.

Não recrie projeto sem necessidade.

Ao final de cada fase:

1. execute lint;
2. execute testes;
3. execute typecheck;
4. execute build;
5. corrija erros;
6. registre o que foi concluído;
7. informe próximos passos.

---

# 61. DOCUMENTAÇÃO

Criar:

```text
README.md
docs/
├── architecture.md
├── database.md
├── commerce-rules.md
├── admin.md
├── deployment.md
└── integrations.md
```

README deve explicar:

- instalação;
- variáveis;
- banco;
- migrations;
- seed;
- execução;
- build;
- deploy.

---

# 62. CRITÉRIOS DE ACEITE DO MVP

O MVP só será considerado pronto quando:

- Home estiver completa;
- catálogo funcionar;
- filtros funcionarem;
- busca funcionar;
- página de produto funcionar;
- carrinho persistir;
- checkout funcionar;
- pedido for criado;
- estoque for controlado;
- cupom for validado;
- pagamento possuir provider;
- retirada local funcionar;
- cliente acompanhar pedido;
- Admin gerenciar produtos;
- Admin gerenciar estoque;
- Admin visualizar pedidos;
- responsividade estiver correta;
- build passar;
- TypeScript não possuir erros;
- lint não possuir erros críticos;
- nenhuma chave secreta estiver no código.

---

# 63. PRIORIDADE DE PRODUTO

A prioridade não é implementar a maior quantidade de funcionalidades.

A prioridade é:

```text
1. vender;
2. passar confiança;
3. facilitar descoberta;
4. facilitar checkout;
5. controlar operação;
6. permitir crescimento.
```

---

# 64. O QUE NÃO FAZER

Não:

- criar marketplace multi-vendedor;
- criar microserviços;
- usar complexidade desnecessária;
- inventar integrações;
- armazenar cartão;
- confiar em preço do frontend;
- usar dados fictícios em produção;
- poluir a interface;
- exagerar no dourado;
- transformar o visual em algo barroco;
- usar animações pesadas;
- criar cadastro obrigatório antes do checkout;
- deixar Admin sem autorização server-side.

---

# 65. PRIMEIRA TAREFA

Comece agora pela **FASE 0 — Auditoria e Planejamento**.

Sua primeira resposta deve conter:

1. diagnóstico do repositório;
2. tecnologias encontradas;
3. o que pode ser reutilizado;
4. riscos técnicos;
5. estrutura proposta;
6. dependências necessárias;
7. plano de implementação por fase;
8. arquivos que serão criados/alterados.

**Não comece a reescrever todo o projeto antes de concluir essa análise.**

Depois da auditoria, implemente a **FASE 1 — Fundação**.

Mantenha todo o projeto com padrão profissional de produção.
