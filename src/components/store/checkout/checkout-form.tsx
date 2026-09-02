"use client";

import { useActionState, useState, useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { maskCep, maskCpf, maskPhone } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { createOrderAction, type CheckoutActionState } from "@/modules/orders/actions";
import { calculateShippingAction, type ShippingCalcState } from "@/modules/shipping/actions";

const initialCheckoutState: CheckoutActionState = { status: "idle" };
const initialShippingState: ShippingCalcState = { status: "idle" };

export function CheckoutForm({
  subtotal,
  discount,
  allowCardPayment,
}: {
  subtotal: number;
  discount: number;
  allowCardPayment: boolean;
}) {
  const [checkoutState, checkoutAction, isSubmitting] = useActionState(createOrderAction, initialCheckoutState);
  const [shippingState, calculateShipping, isCalculatingShipping] = useActionState(
    calculateShippingAction,
    initialShippingState,
  );
  const [, startTransition] = useTransition();
  const [selectedMethod, setSelectedMethod] = useState<string>("LOCAL_PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");

  const selectedOption = shippingState.options?.find((o) => o.method === selectedMethod);
  const shippingCost = selectedMethod === "LOCAL_PICKUP" ? 0 : (selectedOption?.cost ?? 0);
  const total = Math.max(0, subtotal - discount) + shippingCost;

  return (
    <form action={checkoutAction} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="shippingMethod" value={selectedMethod} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <div className="space-y-8">
        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-xl text-fa-black">Contato</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome completo" name="contactName" required autoComplete="name" />
            <Field
              label="CPF"
              name="contactCpf"
              required
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={14}
              inputMode="numeric"
              onInput={(e) => {
                e.currentTarget.value = maskCpf(e.currentTarget.value);
              }}
            />
            <Field label="E-mail" name="contactEmail" type="email" required autoComplete="email" />
            <Field
              label="WhatsApp"
              name="contactPhone"
              required
              autoComplete="tel"
              placeholder="(47) 90000-0000"
              maxLength={15}
              inputMode="numeric"
              onInput={(e) => {
                e.currentTarget.value = maskPhone(e.currentTarget.value);
              }}
            />
          </div>
        </section>

        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-xl text-fa-black">Entrega</h2>

          <div className="mt-4 flex gap-2">
            <input
              name="cep"
              placeholder="Seu CEP"
              maxLength={9}
              inputMode="numeric"
              className="h-10 flex-1 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
              onInput={(e) => {
                e.currentTarget.value = maskCep(e.currentTarget.value);
              }}
              onBlur={(e) => {
                if (e.target.value.replace(/\D/g, "").length === 8) {
                  const fd = new FormData();
                  fd.set("cep", e.target.value);
                  startTransition(() => calculateShipping(fd));
                }
              }}
            />
            <button
              type="button"
              disabled={isCalculatingShipping}
              onClick={(e) => {
                const form = e.currentTarget.closest("form");
                const cep = (form?.elements.namedItem("cep") as HTMLInputElement)?.value ?? "";
                const fd = new FormData();
                fd.set("cep", cep);
                startTransition(() => calculateShipping(fd));
              }}
              className="h-10 rounded-sm border border-fa-black px-4 text-xs font-medium uppercase tracking-wide text-fa-black hover:bg-fa-black hover:text-fa-white disabled:opacity-50"
            >
              {isCalculatingShipping ? "Calculando..." : "Calcular"}
            </button>
          </div>
          {shippingState.status === "error" && (
            <p className="mt-2 text-xs text-red-600">{shippingState.message}</p>
          )}

          <fieldset className="mt-4 space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">
              Forma de entrega
            </legend>
            <ShippingOption
              method="LOCAL_PICKUP"
              label="Retirar na loja — R. Maracujá, 72, Sertãozinho, Bombinhas/SC"
              cost={0}
              selected={selectedMethod === "LOCAL_PICKUP"}
              onSelect={setSelectedMethod}
            />
            {shippingState.options
              ?.filter((o) => o.method !== "LOCAL_PICKUP")
              .map((option) => (
                <ShippingOption
                  key={option.method}
                  method={option.method}
                  label={option.label}
                  cost={option.cost}
                  estimatedDays={option.estimatedDays}
                  selected={selectedMethod === option.method}
                  onSelect={setSelectedMethod}
                />
              ))}
          </fieldset>

          {selectedMethod !== "LOCAL_PICKUP" && (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Endereço" name="street" required className="sm:col-span-2" />
              <Field label="Número" name="number" required />
              <Field label="Complemento" name="complement" />
              <Field label="Bairro" name="neighborhood" required />
              <Field label="Cidade" name="city" required />
              <Field label="UF" name="state" required maxLength={2} />
            </div>
          )}
        </section>

        <section className="rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
          <h2 className="font-display text-xl text-fa-black">Pagamento</h2>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={paymentMethod === "PIX"}
                onChange={() => setPaymentMethod("PIX")}
              />
              PIX
            </label>
            {allowCardPayment && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                />
                Cartão de crédito
              </label>
            )}
          </div>
        </section>
      </div>

      <div className="h-fit space-y-4 rounded-sm border border-fa-stone/15 bg-fa-white p-6 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/60">Resumo</p>
        <dl className="space-y-2 text-sm">
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
            <dd className="text-fa-black">{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-fa-stone/20 pt-2 text-base font-semibold">
            <dt className="text-fa-black">Total</dt>
            <dd className="text-fa-black">{formatPrice(total)}</dd>
          </div>
        </dl>

        {checkoutState.status === "error" && (
          <p className="text-sm text-red-600">{checkoutState.message}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Processando..." : "Finalizar compra"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-xs font-medium text-fa-black/70">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        {...rest}
      />
    </div>
  );
}

function ShippingOption({
  method,
  label,
  cost,
  estimatedDays,
  selected,
  onSelect,
}: {
  method: string;
  label: string;
  cost: number;
  estimatedDays?: number;
  selected: boolean;
  onSelect: (method: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-sm border border-fa-stone/20 px-3 py-2 text-sm has-checked:border-fa-gold">
      <span className="flex items-center gap-2">
        <input type="radio" checked={selected} onChange={() => onSelect(method)} />
        <span>
          {label}
          {estimatedDays && <span className="text-fa-black/50"> — até {estimatedDays} dias úteis</span>}
        </span>
      </span>
      <span className="font-semibold">{cost === 0 ? "Grátis" : formatPrice(cost)}</span>
    </label>
  );
}
