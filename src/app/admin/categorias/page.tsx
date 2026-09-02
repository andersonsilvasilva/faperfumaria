import type { Metadata } from "next";
import Link from "next/link";
import { listCategoriesForAdmin } from "@/modules/admin/categories-queries";
import { deleteCategoryAction } from "@/modules/admin/categories-actions";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categorias | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Categorias</h1>
        <ButtonLink href="/admin/categorias/novo" className="px-4 py-2 text-xs">
          Nova categoria
        </ButtonLink>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria mãe</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">{category.name}</td>
                <td className="px-4 py-3 text-fa-black/60">{category.parent?.name ?? "—"}</td>
                <td className="px-4 py-3 text-fa-black/60">{category._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/categorias/${category.id}`} className="text-fa-gold hover:underline">
                    Editar
                  </Link>
                  <form action={deleteCategoryAction} className="ml-4 inline">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <button type="submit" className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
