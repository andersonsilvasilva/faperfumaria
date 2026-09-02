import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { getBestSellers } from "@/modules/catalog/queries";

export async function BestSellersSection() {
  const products = await getBestSellers(4);

  if (products.length === 0) return null;

  return (
    <section className="border-t border-fa-stone/15 bg-fa-white py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">
              Escolhas dos clientes
            </p>
            <h2 className="mt-2 font-display text-3xl text-fa-black">Os queridinhos da FA</h2>
            <p className="mt-2 max-w-xl text-fa-black/70">
              Perfumes que conquistam pela fragrância, personalidade e presença.
            </p>
          </div>
          <ButtonLink href="/loja?sort=mais-vendidos" variant="secondary">
            Ver mais vendidos
          </ButtonLink>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
