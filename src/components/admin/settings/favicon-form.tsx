"use client";

import { useActionState, useState } from "react";
import { setFaviconAction, type SettingActionState } from "@/modules/admin/settings-actions";
import { ImageUploadField } from "@/components/admin/upload/image-upload-field";

const initialState: SettingActionState = { status: "idle" };

export function FaviconForm({ faviconUrl }: { faviconUrl: string | null }) {
  const [state, formAction, isPending] = useActionState(setFaviconAction, initialState);
  const [url, setUrl] = useState(faviconUrl ?? "");

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-fa-black/70">Favicon do site</label>
        <div className="mt-1 max-w-md">
          <ImageUploadField
            name="url"
            value={url}
            onChange={setUrl}
            folder="configuracoes"
            placeholder="URL do favicon ou envie um arquivo"
          />
        </div>
        <p className="mt-1 text-xs text-fa-black/40">
          Imagem quadrada (ex.: 512x512px), formato PNG. Deixe em branco para usar o ícone padrão.
        </p>
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
