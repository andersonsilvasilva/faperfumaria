"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { CategoryActionState } from "@/modules/admin/categories-actions";

const initialState: CategoryActionState = { status: "idle" };

export function CategoryForm({
  action,
  category,
  parentOptions,
}: {
  action: (prevState: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
  category?: { name: string; parentId: string | null };
  parentOptions: { id: string; name: string }[];
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
          defaultValue={category?.name}
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="parentId" className="text-xs font-medium text-fa-black/70">
          Categoria mãe (opcional)
        </label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        >
          <option value="">Nenhuma</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar categoria"}
      </Button>
    </form>
  );
}
