"use client";

import { forwardRef, useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { maskCep, maskPhone } from "@/lib/masks";
import type { AddressActionState } from "@/modules/addresses/actions";
import { lookupCepClient } from "@/lib/viacep-client";

const initialState: AddressActionState = { status: "idle" };

export interface AddressFormValues {
  label?: string;
  recipientName?: string;
  phone?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  city?: string;
  state?: string;
  isDefault?: boolean;
}

export function AddressForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (prevState: AddressActionState, formData: FormData) => Promise<AddressActionState>;
  initialValues?: AddressFormValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "error">("idle");
  const streetRef = useRef<HTMLInputElement>(null);
  const neighborhoodRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const digits = e.currentTarget.value.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepStatus("loading");
    const data = await lookupCepClient(digits);
    if (!data) {
      setCepStatus("error");
      return;
    }
    if (streetRef.current) streetRef.current.value = data.logradouro;
    if (neighborhoodRef.current) neighborhoodRef.current.value = data.bairro;
    if (cityRef.current) cityRef.current.value = data.localidade;
    if (stateRef.current) stateRef.current.value = data.uf;
    setCepStatus("idle");
    numberRef.current?.focus();
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Nome do endereço" name="label" defaultValue={initialValues?.label} placeholder="Casa, Trabalho..." required />
        <TextField label="Destinatário" name="recipientName" defaultValue={initialValues?.recipientName} required />
        <TextField
          label="Telefone"
          name="phone"
          defaultValue={initialValues?.phone}
          required
          onInput={(e) => {
            e.currentTarget.value = maskPhone(e.currentTarget.value);
          }}
        />
        <div>
          <TextField
            label="CEP"
            name="zipCode"
            defaultValue={initialValues?.zipCode}
            required
            onInput={(e) => {
              e.currentTarget.value = maskCep(e.currentTarget.value);
            }}
            onBlur={handleCepBlur}
          />
          {cepStatus === "loading" && <p className="mt-1 text-xs text-fa-black/50">Buscando endereço...</p>}
          {cepStatus === "error" && (
            <p className="mt-1 text-xs text-red-600">CEP não encontrado — preencha manualmente.</p>
          )}
        </div>
        <TextField
          ref={streetRef}
          label="Endereço"
          name="street"
          defaultValue={initialValues?.street}
          required
          className="sm:col-span-2"
        />
        <TextField ref={numberRef} label="Número" name="number" defaultValue={initialValues?.number} required />
        <TextField label="Complemento" name="complement" defaultValue={initialValues?.complement ?? ""} />
        <TextField
          ref={neighborhoodRef}
          label="Bairro"
          name="neighborhood"
          defaultValue={initialValues?.neighborhood}
          required
        />
        <TextField ref={cityRef} label="Cidade" name="city" defaultValue={initialValues?.city} required />
        <TextField ref={stateRef} label="UF" name="state" defaultValue={initialValues?.state} required maxLength={2} />
      </div>

      <label className="flex items-center gap-2 text-sm text-fa-black">
        <input type="checkbox" name="isDefault" defaultChecked={initialValues?.isDefault} />
        Definir como endereço padrão
      </label>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}

const TextField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
  } & React.InputHTMLAttributes<HTMLInputElement>
>(function TextField({ label, name, required = false, className = "", ...rest }, ref) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-xs font-medium text-fa-black/70">
        {label}
        {required && " *"}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        required={required}
        className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        {...rest}
      />
    </div>
  );
});
