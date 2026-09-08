import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Exporta em CSV só os inscritos que optaram por receber marketing (marketingOptIn=true) —
 * nunca todos os cadastros, pra respeitar o consentimento (ver seção 47 do CLAUDE.md). */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: 401 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { marketingOptIn: true },
    orderBy: { createdAt: "desc" },
  });

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const header = ["E-mail", "Origem", "Consentimento em"].join(",");
  const rows = subscribers.map((subscriber) =>
    [
      csvEscape(subscriber.email),
      csvEscape(subscriber.source ?? ""),
      csvEscape(dateFormatter.format(subscriber.consentAt)),
    ].join(","),
  );

  // BOM no início — sem isso o Excel exibe acentos errados em CSV UTF-8.
  const csv = `﻿${[header, ...rows].join("\n")}`;
  const filename = `newsletter-fa-perfumaria-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
