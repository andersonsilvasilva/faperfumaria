import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/store/product/product-gallery";
import { VariantSelector } from "@/components/store/product/variant-selector";
import { FragrancePyramid } from "@/components/store/product/fragrance-pyramid";
import { ProductCard } from "@/components/store/product-card";
import { ReviewList } from "@/components/store/product/review-list";
import { ReviewForm } from "@/components/store/product/review-form";
import { getProductBySlug, getRelatedProducts } from "@/modules/catalog/queries";
import { getProductReviews, getReviewSummary, getReviewEligibility } from "@/modules/reviews/queries";
import { INTENSITY_LABELS } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

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

  const [relatedProducts, reviews, reviewSummary, reviewEligibility] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(product.id),
    getReviewSummary(product.id),
    getReviewEligibility(product.id),
  ]);
  const occasionTags = product.profileTags.filter((pt) => pt.tag.type === "OCCASION");
  const seasonTags = product.profileTags.filter((pt) => pt.tag.type === "SEASON");
  const personalityTags = product.profileTags.filter((pt) => pt.tag.type === "PERSONALITY");
  const whenToUseTags = [...occasionTags, ...seasonTags];

  const discountPercent = product.compareAtPrice
    ? Math.round((1 - Number(product.price.toString()) / Number(product.compareAtPrice.toString())) * 100)
    : null;

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="dark">{product.brand.name}</Badge>
            {product.olfactoryFamily && <Badge variant="outline">{product.olfactoryFamily.name}</Badge>}
            {product.intensity && <Badge variant="outline">{INTENSITY_LABELS[product.intensity]}</Badge>}
            {discountPercent !== null && discountPercent > 0 && (
              <Badge variant="gold">-{discountPercent}% OFF</Badge>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl text-fa-black">{product.name}</h1>
          {discountPercent !== null && (
            <p className="mt-1 text-sm text-fa-black/40 line-through">
              {formatPrice(product.compareAtPrice!)}
            </p>
          )}

          <div className="mt-6">
            <VariantSelector
              productId={product.id}
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

        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-2xl text-fa-black">Pirâmide olfativa</h2>
          <div className="mt-4">
            <FragrancePyramid notes={product.fragranceNotes} />
          </div>
        </section>

        {personalityTags.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-fa-black">Perfil</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {personalityTags.map((pt) => (
                <Badge key={pt.tag.id} variant="outline">
                  {pt.tag.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {whenToUseTags.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-fa-black">Quando usar</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {whenToUseTags.map((t) => (
                <Badge key={t.tag.id} variant="outline">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-2xl text-fa-black">Informações técnicas</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
            {product.olfactoryFamily && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Família olfativa</dt>
                <dd className="mt-1.5">
                  <Badge variant="outline">{product.olfactoryFamily.name}</Badge>
                </dd>
              </div>
            )}
            {product.intensity && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fa-black/50">Intensidade</dt>
                <dd className="mt-1.5">
                  <Badge variant="outline">{INTENSITY_LABELS[product.intensity]}</Badge>
                </dd>
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
          <div className="mt-4">
            <ReviewList reviews={reviews} average={reviewSummary.average} count={reviewSummary.count} />
          </div>
          <div className="mt-8 border-t border-fa-stone/15 pt-6">
            <h3 className="font-display text-lg text-fa-black">Deixe sua avaliação</h3>
            <div className="mt-3">
              <ReviewForm productId={product.id} productSlug={product.slug} eligibility={reviewEligibility} />
            </div>
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
