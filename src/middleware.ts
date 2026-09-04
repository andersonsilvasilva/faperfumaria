import { NextResponse, type NextRequest } from "next/server";

/**
 * Só repassa o caminho atual como header — a verificação de modo de manutenção em si (que
 * precisa do Prisma) acontece no layout da loja (Node.js runtime), não aqui. Sem essa ponte não
 * dá pra saber a rota atual dentro de um Server Component de layout.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
