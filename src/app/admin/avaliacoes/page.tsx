import type { Metadata } from "next";
import Link from "next/link";
import { listReviewsForAdmin } from "@/modules/admin/reviews-queries";
import { toggleReviewVisibilityAction } from "@/modules/admin/reviews-actions";
import { Badge } from "@/components/ui/badge";
import { REVIEW_STATUS_LABELS } from "@/lib/labels";
import type { ReviewStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Avaliações | Admin",
};

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const validStatus = STATUS_OPTIONS.includes(status as ReviewStatus) ? (status as ReviewStatus) : undefined;

  const { reviews, total, pageCount } = await listReviewsForAdmin({
    status: validStatus,
    search: q?.trim(),
    page: currentPage,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Avaliações</h1>
        <p className="text-sm text-fa-black/60">{total} avaliação(ões)</p>
      </div>
      <p className="mt-1 text-sm text-fa-black/50">
        Avaliações de clientes com compra confirmada aparecem no produto assim que enviadas.
        Ocultar aqui remove só da vitrine — a nota e o comentário do cliente nunca são alterados.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/avaliacoes">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por produto, cliente ou texto"
          className="h-10 w-72 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
        <select
          name="status"
          defaultValue={validStatus ?? ""}
          className="h-10 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {REVIEW_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-sm bg-fa-black px-4 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Comentário</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhuma avaliação encontrada.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">
                  <Link href={`/produto/${review.product.slug}`} className="hover:text-fa-gold" target="_blank">
                    {review.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-fa-black/70">
                  {review.user.name}
                  <br />
                  <span className="text-xs text-fa-black/40">{review.user.email}</span>
                </td>
                <td className="px-4 py-3 text-fa-gold">{"★".repeat(review.rating)}</td>
                <td className="max-w-xs px-4 py-3 text-fa-black/70">
                  <p className="line-clamp-3">{review.comment}</p>
                  {review.isVerifiedPurchase && (
                    <Badge variant="success" className="mt-1 normal-case">
                      Compra verificada
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={review.status === "HIDDEN" ? "outline" : "success"}>
                    {REVIEW_STATUS_LABELS[review.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-fa-black/60">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(review.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleReviewVisibilityAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <button type="submit" className="text-fa-gold hover:underline">
                      {review.status === "HIDDEN" ? "Reexibir" : "Ocultar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/avaliacoes?${new URLSearchParams({
                ...(validStatus ? { status: validStatus } : {}),
                ...(q ? { q } : {}),
                page: String(p),
              })}`}
              className={`rounded-sm px-3 py-1 ${
                p === currentPage ? "bg-fa-black text-fa-white" : "border border-fa-stone/30 text-fa-black/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
