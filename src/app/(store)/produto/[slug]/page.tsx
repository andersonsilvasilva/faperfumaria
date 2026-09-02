import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/store/product/product-gallery";
import { VariantSelector } from "@/components/store/product/variant-selector";
import { FragrancePyramid } from "@/components/store/product/fragrance-pyramid";
import { ProductCard } from "@/components/store/product-card";
import { getProductBySlug, getRelatedProducts } from "@/modules/catalog/queries";

const INTENSITY_LABELS: Record<string, string> = {
  SUAVE: "Suave",
  MODERADA: "Moderada",
  MARCANTE: "Marcante",
  INTENSA: "Intensa",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  return {
    title: `${product.name} | FA Perfumaria`,
    description: product.shortDescription ?? undefined,
    openGraph: {
      title: `${product.name} | FA Perfumaria`,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);
  const occasionTags = product.profileTags.filter((pt) => pt.tag.type === "OCCASION");
  const seasonTags = product.profileTags.filter((pt) => pt.tag.type === "SEASON");
  const personalityTags = product.profileTags.filter((pt) => pt.tag.type === "PERSONALITY");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand.name },
    description: product.shortDescription ?? undefined,
    image: product.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price.toString(),
      availability: product.variants.some((v) => v.stockQty > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Container className="py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-xs text-fa-black/50">
        <Link href="/" className="hover:text-fa-gold">
          Início
        </Link>{" "}
        / <Link href="/loja" className="hover:text-fa-gold">Loja</Link> /{" "}
        <span className="text-fa-black">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <p className="text-xs uppercase tracking-wide text-fa-black/50">{product.brand.name}</p>
          <h1 className="mt-1 font-display text-3xl text-fa-black">{product.name}</h1>

          <div className="mt-6">
            <VariantSelector
              variants={product.variants.map((variant) => ({
                id: variant.id,
                volumeMl: variant.volumeMl,
                price: Number(variant.price),
                stockQty: variant.stockQty,
              }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-12">
        {product.shortDescription && (
          <section>
            <h2 className="font-display text-2xl text-fa-black">Sobre esta fragrância</h2>
            <p className="mt-3 max-w-2xl text-fa-black/70">
              {product.longDescription ?? product.shortDescription}
            </p>
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl text-fa-black">Pirâmide olfativa</h2>
          <div className="mt-4">
            <FragrancePyramid notes={product.fragranceNotes} />
          </div>
        </section>

        {personalityTags.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-fa-black">Perfil</h2>
            <p className="mt-3 text-fa-black/70">{personalityTags.map((pt) => pt.tag.name).join(", ")}</p>
          </section>
        )}

        {(occasionTags.length > 0 || seasonTags.length > 0) && (
          <section>
            <h2 className="font-display text-2xl text-fa-black">Quando usar</h2>
            <p className="mt-3 text-fa-black/70">
              {[...occasionTags.map((t) => t.tag.name), ...seasonTags.map((t) => t.tag.name)].join(", ")}
            </p>
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl text-fa-black">Informações técnicas</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.olfactoryFamily && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Família olfativa</dt>
                <dd className="mt-1 text-sm text-fa-black">{product.olfactoryFamily.name}</dd>
              </div>
            )}
            {product.intensity && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Intensidade</dt>
                <dd className="mt-1 text-sm text-fa-black">{INTENSITY_LABELS[product.intensity]}</dd>
              </div>
            )}
            {product.concentration && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Concentração</dt>
                <dd className="mt-1 text-sm text-fa-black">{product.concentration}</dd>
              </div>
            )}
            {product.fixation && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Fixação</dt>
                <dd className="mt-1 text-sm text-fa-black">{product.fixation}</dd>
              </div>
            )}
            {product.projection && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Projeção</dt>
                <dd className="mt-1 text-sm text-fa-black">{product.projection}</dd>
              </div>
            )}
          </dl>
        </section>

        <section>
          <h2 className="font-display text-2xl text-fa-black">Avaliações</h2>
          <div className="mt-4 border border-dashed border-fa-stone/40 py-10 text-center">
            <p className="text-sm text-fa-black/60">
              Ainda não há avaliações para este produto. As avaliações de clientes chegam na Fase 4.
            </p>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-fa-black">Produtos relacionados</h2>
            <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
