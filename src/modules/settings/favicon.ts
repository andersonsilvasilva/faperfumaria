import { prisma } from "@/lib/prisma";

export const FAVICON_SETTING_KEY = "site_favicon";

/** Lido tanto pelo layout raiz (metadata.icons) quanto pelo Admin (formulário). */
export async function getFaviconUrl(): Promise<string | null> {
  const setting = await prisma.storeSetting.findUnique({ where: { key: FAVICON_SETTING_KEY } });
  const value = setting?.value as { url?: string } | null | undefined;
  return value?.url || null;
}
