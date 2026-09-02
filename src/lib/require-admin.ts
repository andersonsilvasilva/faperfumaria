import "server-only";
import { auth } from "@/lib/auth";

export type AdminGuardResult = { ok: true; userId: string } | { ok: false; message: string };

/**
 * Toda Server Action do Admin precisa validar a sessão de novo — o layout de /admin só protege
 * a renderização da página, não os endpoints de Server Action (ver seção 46 do CLAUDE.md:
 * "Admin routes devem ser protegidas server-side").
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Não autenticado." };
  if (session.user.role !== "ADMIN") return { ok: false, message: "Acesso restrito ao administrador." };
  return { ok: true, userId: session.user.id };
}
