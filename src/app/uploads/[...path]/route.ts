import { NextResponse, type NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Serve arquivos de /public/uploads via rota dinâmica em vez de deixar o Next.js servir
 * estaticamente. Em produção (`next start`), uma requisição pra um arquivo de upload feita no
 * instante em que ele ainda não existia no disco (corrida entre a resposta da API de upload e o
 * navegador buscando o preview) faz o Next.js cachear um 404 pra aquele caminho e repeti-lo para
 * sempre depois, mesmo com o arquivo já existindo — só um restart do processo limpava. Uma rota
 * dinâmica lê o arquivo do disco a cada requisição, sem esse cache.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, ...segments);

  if (!filePath.startsWith(uploadsDir + path.sep)) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  try {
    const [fileStat, buffer] = await Promise.all([stat(filePath), readFile(filePath)]);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }
}
