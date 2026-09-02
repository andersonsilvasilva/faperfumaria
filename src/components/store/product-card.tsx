import Image from "next/image";
import Link from "next/link";
import { formatInstallments, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/modules/catalog/queries";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const mainImage = product.images[0];
  const firstVariant = product.variants[0];
  const hasOffer = product.compareAtPrice != null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_15px_35px_-20px_rgba(11,11,11,0.35)] transition-shadow duration-300 hover:shadow-[0_25px_45px_-20px_rgba(11,11,11,0.45)]">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-fa-off-white">
          {mainImage && (
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          )}
          {hasOffer && (
            <Badge variant="gold" className="absolute left-3 top-3">
              Oferta
            </Badge>
          )}
        </div>
      </Link>

      <button
        type="button"
        disabled
        title="Favoritos disponível na Fase 4"
        aria-label="Adicionar aos favoritos"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-fa-white/90 text-fa-black/60 shadow-sm disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.2 4.8 5.6 4.2c2-.35 3.9.6 5 2.3 1.1-1.7 3-2.65 5-2.3 3.4.6 4.8 4 3.1 7.3C19 15.65 12 20 12 20Z" />
        </svg>
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Badge variant="outline" className="w-fit normal-case tracking-normal">
          {product.brand.name}
        </Badge>
        <Link
          href={`/produto/${product.slug}`}
          className="mt-1 font-display text-base text-fa-black hover:text-fa-gold"
        >
          {product.name}
        </Link>
        {firstVariant && <p className="text-xs text-fa-black/50">{firstVariant.volumeMl}ml</p>}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-fa-black">{formatPrice(product.price)}</span>
          {hasOffer && (
            <span className="text-sm text-fa-black/40 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <p className="text-xs text-fa-black/50">{formatInstallments(product.price)}</p>

        <button
          type="button"
          disabled
          title="Carrinho disponível na Fase 3"
          className="mt-3 w-full rounded-sm border border-fa-black py-2 text-xs font-medium uppercase tracking-wide text-fa-black/50 shadow-sm disabled:cursor-not-allowed"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
