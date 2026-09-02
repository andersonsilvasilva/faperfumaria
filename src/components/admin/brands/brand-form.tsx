"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { BrandActionState } from "@/modules/admin/brands-actions";

const initialState: BrandActionState = { status: "idle" };

export function BrandForm({
  action,
  brand,
}: {
  action: (prevState: BrandActionState, formData: FormData) => Promise<BrandActionState>;
  brand?: { name: string; logoUrl: string | null; description: string | null };
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="name" className="text-xs font-medium text-fa-black/70">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={brand?.name}
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="logoUrl" className="text-xs font-medium text-fa-black/70">
          URL do logo (opcional)
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={brand?.logoUrl ?? ""}
          placeholder="/brand/marcas/exemplo.png"
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-xs font-medium text-fa-black/70">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={brand?.description ?? ""}
          className="mt-1 w-full rounded-sm border border-fa-stone/40 px-3 py-2 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar marca"}
      </Button>
    </form>
  );
}
