import type { Metadata } from "next";
import Link from "next/link";
import { listBannersForAdmin } from "@/modules/admin/banners-queries";
import { deleteBannerAction } from "@/modules/admin/banners-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Banners | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await listBannersForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Banners</h1>
        <ButtonLink href="/admin/banners/novo" className="px-4 py-2 text-xs">
          Novo banner
        </ButtonLink>
      </div>

      <div className="mt-6 space-y-4">
        {banners.length === 0 && (
          <p className="rounded-sm border border-dashed border-fa-stone/30 py-10 text-center text-fa-black/50">
            Nenhum banner cadastrado.
          </p>
        )}
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex flex-wrap items-center gap-4 rounded-sm border border-fa-stone/15 bg-fa-white p-4 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]"
          >
            <div className="flex-1">
              <p className="font-medium text-fa-black">{banner.title}</p>
              <p className="text-xs text-fa-black/50">Ordem {banner.position}</p>
              <p className="mt-1 truncate text-xs text-fa-black/40">{banner.desktopImage}</p>
            </div>
            <Badge variant={banner.isActive ? "success" : "outline"}>
              {banner.isActive ? "Ativo" : "Inativo"}
            </Badge>
            <Link href={`/admin/banners/${banner.id}`} className="text-sm text-fa-gold hover:underline">
              Editar
            </Link>
            <form action={deleteBannerAction}>
              <input type="hidden" name="bannerId" value={banner.id} />
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Excluir
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
