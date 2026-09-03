"use client";

import { useActionState } from "react";
import { deleteProductAction } from "@/modules/admin/products-actions";
import type { ProductActionState } from "@/modules/admin/products-actions";

const initialState: ProductActionState = { status: "idle" };

export function ProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const [state, formAction, isPending] = useActionState(deleteProductAction, initialState);

  return (
    <span className="inline-flex items-center gap-2">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!confirm(`Excluir "${productName}" definitivamente? Essa ação não pode ser desfeita.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="productId" value={productId} />
        <button type="submit" disabled={isPending} className="text-red-600 hover:underline disabled:opacity-50">
          {isPending ? "Excluindo..." : "Excluir"}
        </button>
      </form>
      {state.status === "error" && <span className="text-xs text-red-600">{state.message}</span>}
    </span>
  );
}
