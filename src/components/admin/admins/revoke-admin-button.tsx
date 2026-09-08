"use client";

import { useActionState } from "react";
import { revokeAdminAction, type AdminManageActionState } from "@/modules/admin/admins-actions";

const initialState: AdminManageActionState = { status: "idle" };

export function RevokeAdminButton({ userId, name }: { userId: string; name: string }) {
  const [state, formAction, isPending] = useActionState(revokeAdminAction, initialState);

  return (
    <span className="inline-flex items-center gap-2">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!confirm(`Revogar o acesso de administrador de "${name}"? A conta continua existindo como cliente.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" disabled={isPending} className="text-red-600 hover:underline disabled:opacity-50">
          {isPending ? "Revogando..." : "Revogar acesso"}
        </button>
      </form>
      {state.status === "error" && <span className="text-xs text-red-600">{state.message}</span>}
    </span>
  );
}
