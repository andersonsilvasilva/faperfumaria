import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { getFeaturedProducts } from "@/modules/catalog/queries";

export async function FeaturedProductsSection() {
  const products = await getFeaturedProducts(4);

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">Seleção FA</p>
            <h2 className="mt-2 font-display text-3xl text-fa-black">Perfumes em destaque</h2>
            <p className="mt-2 max-w-xl text-fa-black/70">
              Uma seleção especial de fragrâncias que merecem espaço na sua coleção.
            </p>
          </div>
          <ButtonLink href="/loja" variant="secondary">
            Ver loja
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
