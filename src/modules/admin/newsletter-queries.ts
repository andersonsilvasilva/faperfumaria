import "server-only";
import { prisma } from "@/lib/prisma";

export async function listNewsletterSubscribers({ search }: { search?: string } = {}) {
  return prisma.newsletterSubscriber.findMany({
    where: search ? { email: { contains: search } } : {},
    orderBy: { createdAt: "desc" },
  });
}
