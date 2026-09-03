import "server-only";
import { prisma } from "@/lib/prisma";

export async function getActiveHeroBanner() {
  const now = new Date();
  return prisma.banner.findFirst({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { position: "asc" },
  });
}
