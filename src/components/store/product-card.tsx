import Image from "next/image";
import Link from "next/link";
import { formatInstallments, formatPrice, formatVariantLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/store/cart/add-to-cart-button";
import { FavoriteButton } from "@/components/store/favorites/favorite-button";
import type { ProductCardData } from "@/modules/catalog/queries";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const mainImage = product.images[0];
  const firstVariant = product.variants[0];
  const hasOffer =
    product.compareAtPrice != null &&
    Number(product.compareAtPrice.toString()) > Number(product.price.toString());

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
              unoptimized={mainImage.url.startsWith("/uploads/")}
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

      <FavoriteButton
        productId={product.id}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-fa-white/90 text-fa-black/60 shadow-sm transition-colors hover:text-fa-gold disabled:cursor-not-allowed"
      />

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
        {firstVariant && <p className="text-xs text-fa-black/50">{formatVariantLabel(firstVariant)}</p>}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-fa-black">{formatPrice(product.price)}</span>
          {hasOffer && (
            <span className="text-sm text-fa-black/40 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <p className="text-xs text-fa-black/50">
          {formatInstallments(product.price, product.maxInstallments ?? undefined)}
        </p>

        {firstVariant && (
          <AddToCartButton
            variantId={firstVariant.id}
            disabled={firstVariant.stockQty <= 0}
            productName={product.name}
            brandName={product.brand.name}
            price={Number(product.price.toString())}
            className="mt-3 w-full rounded-sm border border-fa-gold bg-fa-gold py-2 text-xs font-medium uppercase tracking-wide text-fa-black shadow-sm transition-colors hover:bg-fa-gold-light hover:border-fa-gold-light disabled:cursor-not-allowed disabled:border-fa-stone/30 disabled:bg-transparent disabled:text-fa-black/40"
          />
        )}
      </div>
    </div>
  );
}
