import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getCartWithItems, calculateCartSubtotal } from "@/modules/cart/queries";
import { CheckoutForm } from "@/components/store/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const cart = await getCartWithItems();

  if (!cart || cart.items.length === 0) {
    redirect("/carrinho");
  }

  const subtotal = calculateCartSubtotal(cart);

  let discount = 0;
  if (cart.coupon) {
    const value = Number(cart.coupon.value.toString());
    discount =
      cart.coupon.type === "PERCENTAGE" ? Math.round(((subtotal * value) / 100) * 100) / 100 : Math.min(value, subtotal);
  }

  const allowCardPayment = process.env.PAYMENT_PROVIDER !== "mercadopago";

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-fa-black">Finalizar compra</h1>
      <div className="mt-8">
        <CheckoutForm subtotal={subtotal} discount={discount} allowCardPayment={allowCardPayment} />
      </div>
    </Container>
  );
}
