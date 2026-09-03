import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/require-admin";

const ALLOWED_FOLDERS = ["produtos", "marcas", "banners"] as const;
type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload de imagens do Admin (produtos, marcas, banners). Sem storage em nuvem configurado
 * ainda — grava direto em /public/uploads/<pasta>/, que funciona em qualquer hospedagem Node
 * tradicional com disco persistente (ver docs/deployment.md sobre o ambiente Hostinger). Se um
 * dia a aplicação for para uma hospedagem serverless (disco efêmero), essa rota precisa trocar
 * para um provider de storage em nuvem (S3-compatível, etc.) — arquitetura pronta para isso, só
 * não implementada por falta de credenciais reais (ver docs/integrations.md).
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderInput = formData.get("folder")?.toString();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const folder = ALLOWED_FOLDERS.includes(folderInput as UploadFolder) ? (folderInput as UploadFolder) : null;
  if (!folder) {
    return NextResponse.json({ error: "Pasta de destino inválida." }, { status: 400 });
  }

  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato não suportado. Envie JPEG, PNG, WEBP ou GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 5MB." }, { status: 400 });
  }

  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
}
