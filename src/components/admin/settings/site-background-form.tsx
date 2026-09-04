"use client";

import { useActionState } from "react";
import { setSiteBackgroundAction, type SettingActionState } from "@/modules/admin/settings-actions";
import type { SiteBackground } from "@/modules/settings/site-background";

const initialState: SettingActionState = { status: "idle" };

export function SiteBackgroundForm({ background }: { background: SiteBackground }) {
  const [state, formAction, isPending] = useActionState(setSiteBackgroundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="text-xs font-medium text-fa-black/70" htmlFor="colorStart">
            Cor inicial do degradê
          </label>
          <input
            id="colorStart"
            type="color"
            name="colorStart"
            defaultValue={background.colorStart}
            className="mt-1 h-10 w-20 rounded-sm border border-fa-stone/40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-fa-black/70" htmlFor="colorEnd">
            Cor final do degradê
          </label>
          <input
            id="colorEnd"
            type="color"
            name="colorEnd"
            defaultValue={background.colorEnd}
            className="mt-1 h-10 w-20 rounded-sm border border-fa-stone/40"
          />
        </div>
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
