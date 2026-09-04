import { prisma } from "@/lib/prisma";

export const MAINTENANCE_SETTING_KEY = "maintenance_mode";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Estamos em manutenção rápida para deixar tudo pronto para você. Voltamos em instantes.";

export interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

/** Lido tanto pelo layout da loja (bloqueio) quanto pelo Admin (formulário de configuração). */
export async function getMaintenanceMode(): Promise<MaintenanceMode> {
  const setting = await prisma.storeSetting.findUnique({ where: { key: MAINTENANCE_SETTING_KEY } });
  const value = setting?.value as Partial<MaintenanceMode> | null | undefined;
  return {
    enabled: value?.enabled === true,
    message: value?.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
  };
}
