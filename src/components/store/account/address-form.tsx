"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { maskCep, maskPhone } from "@/lib/masks";
import type { AddressActionState } from "@/modules/addresses/actions";

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
        <TextField
          label="CEP"
          name="zipCode"
          defaultValue={initialValues?.zipCode}
          required
          onInput={(e) => {
            e.currentTarget.value = maskCep(e.currentTarget.value);
          }}
        />
        <TextField label="Endereço" name="street" defaultValue={initialValues?.street} required className="sm:col-span-2" />
        <TextField label="Número" name="number" defaultValue={initialValues?.number} required />
        <TextField label="Complemento" name="complement" defaultValue={initialValues?.complement ?? ""} />
        <TextField label="Bairro" name="neighborhood" defaultValue={initialValues?.neighborhood} required />
        <TextField label="Cidade" name="city" defaultValue={initialValues?.city} required />
        <TextField label="UF" name="state" defaultValue={initialValues?.state} required maxLength={2} />
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

function TextField({
  label,
  name,
  required = false,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
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
        required={required}
        className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        {...rest}
      />
    </div>
  );
}
