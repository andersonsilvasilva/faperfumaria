import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prismaClient: PrismaClient | undefined;
}

function createPrismaClient() {
  // O driver `mariadb` só reconhece `connectionLimit` (camelCase) num objeto de config — um
  // parâmetro `?connection_limit=N` na URL é silenciosamente ignorado (o parser da string de
  // conexão não normaliza nomes de opção), então o pool sempre usava o padrão de 10 por processo,
  // nunca o valor pretendido. Por isso montamos o config a partir da URL manualmente.
  //
  // connectionLimit baixo (2) de propósito: hospedagens compartilhadas com processo gerenciado
  // (ex.: Hostinger "Deploy Web App") podem reiniciar o processo por gerenciamento de recursos —
  // cada reinício cria um pool novo, e cada conexão nova consome do limite de conexões/hora da
  // conta de banco (recurso limitado nesse plano). Ver docs/database.md.
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

// Cachear em globalThis também em produção: o Next.js compila rotas/actions em chunks
// separados, e sem esse cache global cada chunk que importa este módulo pela primeira vez
// criava seu PRÓPRIO PrismaClient (e pool), multiplicando conexões novas sem nenhum reload
// acontecer — o gargalo real por trás do limite de conexões/hora da conta, não recriação do
// processo. Guardar só em dev era a causa; cachear sempre corrige.
export const prisma = globalThis.prismaClient ?? createPrismaClient();
globalThis.prismaClient = prisma;
