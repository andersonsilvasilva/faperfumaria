import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { requireAdmin } from "@/lib/require-admin";

const ALLOWED_FOLDERS = ["produtos", "marcas", "banners", "configuracoes"] as const;
type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Maior lado preservado: acima disso não há ganho visível (a loja exibe no máximo ~1200px).
const MAX_DIMENSION_PX = 2400;

/**
 * Reduz o peso do arquivo sem diminuir a resolução abaixo de MAX_DIMENSION_PX. PNG sem
 * transparência (fotos de produto) vira JPEG de alta qualidade — é onde está o maior ganho;
 * PNG com transparência e WebP mantêm o formato. Se a recompressão falhar ou não ficar menor,
 * mantém o arquivo original. GIF não é tocado (perderia a animação).
 */
async function compressImage(
  input: Buffer,
  extension: string,
): Promise<{ buffer: Buffer; extension: string }> {
  const original = { buffer: input, extension };
  if (extension === "gif") return original;
  try {
    const pipeline = sharp(input).rotate().resize({
      width: MAX_DIMENSION_PX,
      height: MAX_DIMENSION_PX,
      fit: "inside",
      withoutEnlargement: true,
    });
    let output: { buffer: Buffer; extension: string };
    if (extension === "jpg") {
      output = { buffer: await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer(), extension };
    } else if (extension === "png") {
      const { hasAlpha } = await sharp(input).metadata();
      output = hasAlpha
        ? { buffer: await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer(), extension }
        : { buffer: await pipeline.jpeg({ quality: 90, mozjpeg: true }).toBuffer(), extension: "jpg" };
    } else {
      output = { buffer: await pipeline.webp({ quality: 90 }).toBuffer(), extension };
    }
    return output.buffer.length < input.length ? output : original;
  } catch {
    return original;
  }
}

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

  const compressed = await compressImage(Buffer.from(await file.arrayBuffer()), extension);
  const filename = `${randomUUID()}.${compressed.extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  await writeFile(path.join(uploadDir, filename), compressed.buffer);

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
}
