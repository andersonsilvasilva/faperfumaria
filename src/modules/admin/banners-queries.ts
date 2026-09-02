import "server-only";
import { prisma } from "@/lib/prisma";

export async function listBannersForAdmin() {
  return prisma.banner.findMany({ orderBy: { position: "asc" } });
}

export async function getBannerForAdmin(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}
