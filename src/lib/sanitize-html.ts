import "server-only";

/**
 * Sanitização leve do HTML gerado pelo editor de texto rico (Quill) no Admin — o toolbar em si
 * não permite digitar tags perigosas, mas colar conteúdo de outra origem pode trazer algo que
 * sobreviva ao próprio sanitizador do Quill. Não é um parser HTML completo (suficiente pro
 * conteúdo de um editor WYSIWYG só com formatação de texto, nunca script/iframe/etc.), só uma
 * camada extra de defesa — o admin já é uma área autenticada e restrita a ADMIN.
 */
export function sanitizeRichText(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'")
    // O Quill costuma salvar espaços comuns como "&nbsp;"/U+00A0 (não-quebráveis). Um parágrafo
    // inteiro assim vira uma única "palavra" gigante pro navegador, que quebra no meio de
    // qualquer jeito pra não estourar a largura da tela — normaliza de volta pra espaço comum.
    .replace(/&nbsp;/gi, " ")
    .replace(/ /g, " ");
}
