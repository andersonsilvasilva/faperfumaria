import "server-only";
import { prisma } from "@/lib/prisma";

export async function listStoreSettings() {
  return prisma.storeSetting.findMany({ orderBy: { key: "asc" } });
}
