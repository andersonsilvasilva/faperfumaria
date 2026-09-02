import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { getCartWithItems, calculateCartSubtotal } from "@/modules/cart/queries";
import { CartItemRow } from "@/components/store/cart/cart-item-row";
import { CouponForm } from "@/components/store/cart/coupon-form";
import { ShippingCalculator } from "@/components/store/cart/shipping-calculator";

export const metadata: Metadata = {
  title: "Carrinho",
};

export default async function CarrinhoPage() {
  const cart = await getCartWithItems();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <Container className="max-w-2xl py-20 text-center">
        <h1 className="font-display text-3xl text-fa-black">Seu carrinho está vazio</h1>
        <p className="mt-3 text-fa-black/60">
          Explore nossa seleção de fragrâncias e encontre a sua próxima essência.
        </p>
        <ButtonLink href="/loja" className="mt-8">
          Explorar perfumes
        </ButtonLink>
      </Container>
    );
  }

  const subtotal = calculateCartSubtotal(cart!);

  let discount = 0;
  if (cart!.coupon) {
    const value = Number(cart!.coupon.value.toString());
    discount = cart!.coupon.type === "PERCENTAGE" ? Math.round(((subtotal * value) / 100) * 100) / 100 : Math.min(value, subtotal);
  }

  const total = Math.max(0, subtotal - discount);

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-fa-black/50">
        <Link href="/" className="hover:text-fa-gold">
          Início
        </Link>{" "}
        / <span className="text-fa-black">Carrinho</span>
      </nav>
      <h1 className="mt-3 font-display text-3xl text-fa-black">Carrinho</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={{
                id: item.id,
                quantity: item.quantity,
                variant: {
                  id: item.variant.id,
                  volumeMl: item.variant.volumeMl,
                  price: Number(item.variant.price.toString()),
                  stockQty: item.variant.stockQty,
                  product: {
                    name: item.variant.product.name,
                    slug: item.variant.product.slug,
                    brand: { name: item.variant.product.brand.name },
                    images: item.variant.product.images.map((image) => ({
                      url: image.url,
                      altText: image.altText,
                    })),
                  },
                },
              }}
            />
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Cupom de desconto</p>
            <div className="mt-3">
              <CouponForm appliedCode={cart!.coupon?.code} />
            </div>
          </div>

          <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Calcular frete</p>
            <div className="mt-3">
              <ShippingCalculator />
            </div>
          </div>

          <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Resumo</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-fa-black/70">Subtotal</dt>
                <dd className="text-fa-black">{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-fa-black/70">Desconto</dt>
                  <dd className="text-green-700">−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-fa-black/70">Frete</dt>
                <dd className="text-fa-black/50">calculado no checkout</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-fa-stone/20 pt-2 text-base font-semibold">
                <dt className="text-fa-black">Total</dt>
                <dd className="text-fa-black">{formatPrice(total)}</dd>
              </div>
            </dl>

            <ButtonLink href="/checkout" className="mt-6 w-full">
              Finalizar compra
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
