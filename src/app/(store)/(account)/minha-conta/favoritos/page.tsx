import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { getFavoriteProductIds } from "@/modules/favorites/queries";
import { getProductsByIds } from "@/modules/catalog/queries";

export const metadata: Metadata = {
  title: "Meus favoritos",
};

export default async function FavoritosPage() {
  const productIds = await getFavoriteProductIds();
  const products = await getProductsByIds(productIds);

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Meus favoritos</h1>

      {products.length === 0 ? (
        <div className="mt-6 border border-dashed border-fa-stone/40 py-16 text-center">
          <p className="text-sm text-fa-black/60">Você ainda não favoritou nenhum produto.</p>
          <ButtonLink href="/loja" className="mt-6">
            Explorar perfumes
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
