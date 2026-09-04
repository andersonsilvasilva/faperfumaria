"use client";

import { useActionState } from "react";
import { setMaintenanceModeAction, type SettingActionState } from "@/modules/admin/settings-actions";
import type { MaintenanceMode } from "@/modules/settings/maintenance";

const initialState: SettingActionState = { status: "idle" };

export function MaintenanceToggleForm({ maintenance }: { maintenance: MaintenanceMode }) {
  const [state, formAction, isPending] = useActionState(setMaintenanceModeAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-fa-black">
        <input type="checkbox" name="enabled" defaultChecked={maintenance.enabled} />
        Ativar modo de manutenção (bloqueia a loja para clientes; o Admin continua acessível)
      </label>

      <div>
        <label className="text-xs font-medium text-fa-black/70">Mensagem exibida aos clientes</label>
        <textarea
          name="message"
          rows={3}
          defaultValue={maintenance.message}
          className="mt-1 w-full rounded-sm border border-fa-stone/40 px-3 py-2 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "success" ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-fa-black px-4 py-2 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
