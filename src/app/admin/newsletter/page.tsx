import type { Metadata } from "next";
import { listNewsletterSubscribers } from "@/modules/admin/newsletter-queries";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Newsletter | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const subscribers = await listNewsletterSubscribers({ search: q?.trim() });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Newsletter</h1>
        <p className="text-sm text-fa-black/60">{subscribers.length} inscrito(s)</p>
      </div>

      <form className="mt-6" action="/admin/newsletter">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por e-mail"
          className="h-10 w-72 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Marketing</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum inscrito ainda.
                </td>
              </tr>
            )}
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">{subscriber.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={subscriber.marketingOptIn ? "success" : "outline"}>
                    {subscriber.marketingOptIn ? "Optou" : "Recusou"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-fa-black/60">{subscriber.source ?? "—"}</td>
                <td className="px-4 py-3 text-fa-black/60">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(subscriber.consentAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
