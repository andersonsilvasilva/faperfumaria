import { prisma } from "@/lib/prisma";

export const SITE_BACKGROUND_SETTING_KEY = "site_background";

export interface SiteBackground {
  colorStart: string;
  colorEnd: string;
}

// Mesmo tom off-white já usado hoje (--color-fa-off-white em globals.css) — enquanto o Admin não
// configurar nada, as duas cores iguais reproduzem exatamente o fundo atual, sem gradiente visível.
const DEFAULT_COLOR = "#f7f5f2";

/** Lido tanto pelo layout da loja (aplica o gradiente) quanto pelo Admin (formulário). */
export async function getSiteBackground(): Promise<SiteBackground> {
  const setting = await prisma.storeSetting.findUnique({ where: { key: SITE_BACKGROUND_SETTING_KEY } });
  const value = setting?.value as Partial<SiteBackground> | null | undefined;
  return {
    colorStart: value?.colorStart || DEFAULT_COLOR,
    colorEnd: value?.colorEnd || DEFAULT_COLOR,
  };
}
