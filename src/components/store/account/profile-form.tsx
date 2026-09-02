"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { maskPhone } from "@/lib/masks";
import { updateProfileAction, type AccountActionState } from "@/modules/account/actions";

const initialState: AccountActionState = { status: "idle" };

export function ProfileForm({ name, phone }: { name: string; phone: string | null }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-xs font-medium text-fa-black/70">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          required
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="phone" className="text-xs font-medium text-fa-black/70">
          Telefone / WhatsApp
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={phone ?? ""}
          onInput={(e) => {
            e.currentTarget.value = maskPhone(e.currentTarget.value);
          }}
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "success" ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar dados"}
      </Button>
    </form>
  );
}
