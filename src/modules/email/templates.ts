import { formatPrice } from "@/lib/format";

export interface OrderEmailItem {
  name: string;
  variant: string;
  quantity: number;
  totalPrice: number;
}

export interface OrderEmailContext {
  orderNumber: string;
  contactName: string;
  total: number;
  shippingLabel: string;
  items: OrderEmailItem[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const GOLD = "#c99724";
const BLACK = "#0b0b0b";
const OFF_WHITE = "#f7f5f2";
const STONE = "#9d9c94";

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function orderUrl(orderNumber: string): string {
  return `${SITE_URL}/pedido/${orderNumber}`;
}

function renderLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:${OFF_WHITE};font-family:Georgia,'Times New Roman',serif;color:${BLACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OFF_WHITE};padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid ${STONE}33;">
            <tr>
              <td style="background:${BLACK};padding:24px 32px;">
                <span style="font-size:20px;letter-spacing:2px;color:${GOLD};font-family:Georgia,serif;">FA PERFUMARIA</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${BLACK};">
                <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:normal;color:${BLACK};margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${STONE}33;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${STONE};">
                FA Perfumaria — Bombinhas, SC. Este é um e-mail automático, não responda diretamente.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderItemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid ${STONE}22;">${item.name} — ${item.variant} (x${item.quantity})</td>
        <td style="padding:6px 0;border-bottom:1px solid ${STONE}22;text-align:right;white-space:nowrap;">${formatPrice(item.totalPrice)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;margin:16px 0;">${rows}</table>`;
}

function button(label: string, url: string): string {
  return `<p style="margin:24px 0;"><a href="${url}" style="background:${GOLD};color:${BLACK};text-decoration:none;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:1px;display:inline-block;">${label}</a></p>`;
}

export function orderReceivedEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}!</p>
    <p>Recebemos seu pedido <strong>${ctx.orderNumber}</strong> e ele já está sendo processado.</p>
    ${renderItemsTable(ctx.items)}
    <p>Frete: ${ctx.shippingLabel}<br/>Total: <strong>${formatPrice(ctx.total)}</strong></p>
    ${button("Acompanhar pedido", url)}
  `;
  return {
    subject: `Recebemos seu pedido ${ctx.orderNumber} — FA Perfumaria`,
    html: renderLayout("Pedido recebido", body),
    text: `Olá, ${firstName(ctx.contactName)}! Recebemos seu pedido ${ctx.orderNumber}, total ${formatPrice(ctx.total)}. Acompanhe em: ${url}`,
  };
}

export function paymentApprovedEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}!</p>
    <p>Seu pagamento do pedido <strong>${ctx.orderNumber}</strong> foi aprovado. Já estamos preparando tudo com carinho.</p>
    <p>Total pago: <strong>${formatPrice(ctx.total)}</strong></p>
    ${button("Ver detalhes do pedido", url)}
  `;
  return {
    subject: `Pagamento aprovado — pedido ${ctx.orderNumber}`,
    html: renderLayout("Pagamento aprovado", body),
    text: `Olá, ${firstName(ctx.contactName)}! Seu pagamento do pedido ${ctx.orderNumber} foi aprovado. Detalhes: ${url}`,
  };
}

export function paymentFailedEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}.</p>
    <p>Não conseguimos confirmar o pagamento do pedido <strong>${ctx.orderNumber}</strong>. A reserva dos produtos foi liberada.</p>
    <p>Se ainda tiver interesse, você pode refazer o pedido a qualquer momento pelo nosso site.</p>
    ${button("Ver pedido", url)}
  `;
  return {
    subject: `Pagamento não aprovado — pedido ${ctx.orderNumber}`,
    html: renderLayout("Pagamento recusado", body),
    text: `Olá, ${firstName(ctx.contactName)}. O pagamento do pedido ${ctx.orderNumber} não foi aprovado. Detalhes: ${url}`,
  };
}

export function orderPreparingEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}!</p>
    <p>Seu pedido <strong>${ctx.orderNumber}</strong> está em preparação. Em breve enviaremos com todo o cuidado.</p>
    ${button("Acompanhar pedido", url)}
  `;
  return {
    subject: `Seu pedido ${ctx.orderNumber} está em preparação`,
    html: renderLayout("Pedido em preparação", body),
    text: `Olá, ${firstName(ctx.contactName)}! Seu pedido ${ctx.orderNumber} está em preparação. Acompanhe: ${url}`,
  };
}

export function orderShippedEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}!</p>
    <p>Seu pedido <strong>${ctx.orderNumber}</strong> foi enviado e está a caminho.</p>
    ${button("Acompanhar pedido", url)}
  `;
  return {
    subject: `Seu pedido ${ctx.orderNumber} foi enviado`,
    html: renderLayout("Pedido enviado", body),
    text: `Olá, ${firstName(ctx.contactName)}! Seu pedido ${ctx.orderNumber} foi enviado. Acompanhe: ${url}`,
  };
}

export function orderDeliveredEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}!</p>
    <p>Seu pedido <strong>${ctx.orderNumber}</strong> foi entregue. Esperamos que aproveite!</p>
    <p>Se puder, deixe sua avaliação sobre os produtos — isso ajuda outros clientes.</p>
    ${button("Ver pedido", url)}
  `;
  return {
    subject: `Seu pedido ${ctx.orderNumber} foi entregue`,
    html: renderLayout("Pedido entregue", body),
    text: `Olá, ${firstName(ctx.contactName)}! Seu pedido ${ctx.orderNumber} foi entregue. Detalhes: ${url}`,
  };
}

export function orderCancelledEmail(ctx: OrderEmailContext): EmailTemplate {
  const url = orderUrl(ctx.orderNumber);
  const body = `
    <p>Olá, ${firstName(ctx.contactName)}.</p>
    <p>Seu pedido <strong>${ctx.orderNumber}</strong> foi cancelado. Caso o pagamento já tenha sido efetuado, o estorno segue as regras da forma de pagamento utilizada.</p>
    ${button("Ver pedido", url)}
  `;
  return {
    subject: `Pedido ${ctx.orderNumber} cancelado`,
    html: renderLayout("Pedido cancelado", body),
    text: `Olá, ${firstName(ctx.contactName)}. Seu pedido ${ctx.orderNumber} foi cancelado. Detalhes: ${url}`,
  };
}

export function passwordResetEmail(ctx: { name: string; resetUrl: string }): EmailTemplate {
  const body = `
    <p>Olá, ${firstName(ctx.name)}.</p>
    <p>Recebemos uma solicitação para redefinir sua senha na FA Perfumaria.</p>
    ${button("Redefinir senha", ctx.resetUrl)}
    <p style="font-size:12px;color:${STONE};">Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
  `;
  return {
    subject: "Redefinição de senha — FA Perfumaria",
    html: renderLayout("Redefinir senha", body),
    text: `Olá, ${firstName(ctx.name)}. Para redefinir sua senha, acesse: ${ctx.resetUrl}`,
  };
}
