import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getCartWithItems, calculateCartSubtotal } from "@/modules/cart/queries";
import { CheckoutForm } from "@/components/store/checkout/checkout-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const cart = await getCartWithItems();

  if (!cart || cart.items.length === 0) {
    redirect("/carrinho");
  }

  const session = await auth();
  let initialContact: { name?: string; email?: string; phone?: string } | undefined;
  let initialAddress:
    | {
        zipCode: string;
        street: string;
        number: string;
        complement: string | null;
        neighborhood: string;
        city: string;
        state: string;
      }
    | undefined;

  if (session?.user?.id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          phone: true,
          addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }], take: 1 },
        },
      });
      if (user) {
        initialContact = { name: user.name, email: user.email, phone: user.phone ?? undefined };
        const address = user.addresses[0];
        if (address) {
          initialAddress = {
            zipCode: address.zipCode,
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
          };
        }
      }
    } catch (error) {
      // Pré-preenchimento é conveniência, não deve impedir o cliente de finalizar a compra.
      console.error("Falha ao pré-carregar dados do cliente no checkout:", error);
    }
  }

  const subtotal = calculateCartSubtotal(cart);

  let discount = 0;
  if (cart.coupon) {
    const value = Number(cart.coupon.value.toString());
    discount =
      cart.coupon.type === "PERCENTAGE" ? Math.round(((subtotal * value) / 100) * 100) / 100 : Math.min(value, subtotal);
  }

  const allowCardPayment = process.env.PAYMENT_PROVIDER !== "mercadopago";

  const analyticsItems = cart.items.map((item) => ({
    id: item.variant.id,
    name: item.variant.product.name,
    brand: item.variant.product.brand.name,
    price: Number(item.variant.price.toString()),
    quantity: item.quantity,
  }));

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-fa-black">Finalizar compra</h1>
      <div className="mt-8">
        <CheckoutForm
          subtotal={subtotal}
          discount={discount}
          allowCardPayment={allowCardPayment}
          analyticsItems={analyticsItems}
          initialContact={initialContact}
          initialAddress={initialAddress}
        />
      </div>
    </Container>
  );
}
