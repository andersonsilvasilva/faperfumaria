"use client";

import { useActionState } from "react";
import { saveSettingAction, type SettingActionState } from "@/modules/admin/settings-actions";

const initialState: SettingActionState = { status: "idle" };

export function SettingForm({ settingKey, initialValue }: { settingKey?: string; initialValue?: string }) {
  const [state, formAction, isPending] = useActionState(saveSettingAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-fa-black/70">Chave</label>
        <input
          name="key"
          required
          defaultValue={settingKey}
          readOnly={Boolean(settingKey)}
          className="mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm read-only:bg-fa-off-white focus:border-fa-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-fa-black/70">Valor (JSON)</label>
        <textarea
          name="valueJson"
          required
          rows={4}
          defaultValue={initialValue}
          className="mt-1 w-full rounded-sm border border-fa-stone/40 px-3 py-2 font-mono text-xs focus:border-fa-gold focus:outline-none"
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
