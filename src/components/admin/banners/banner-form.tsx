"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { BannerActionState } from "@/modules/admin/banners-actions";

interface BannerData {
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  desktopImage: string;
  mobileImage: string | null;
  position: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}

const initialState: BannerActionState = { status: "idle" };
const inputClass =
  "mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none";
const labelClass = "text-xs font-medium text-fa-black/70";

function toDateInput(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function BannerForm({
  action,
  banner,
}: {
  action: (prevState: BannerActionState, formData: FormData) => Promise<BannerActionState>;
  banner?: BannerData;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className={labelClass} htmlFor="eyebrow">
          Eyebrow (opcional)
        </label>
        <input id="eyebrow" name="eyebrow" defaultValue={banner?.eyebrow ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="title">
          Título
        </label>
        <input id="title" name="title" required defaultValue={banner?.title} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="subtitle">
          Subtítulo (opcional)
        </label>
        <textarea
          id="subtitle"
          name="subtitle"
          rows={2}
          defaultValue={banner?.subtitle ?? ""}
          className={inputClass.replace("h-10", "py-2")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="ctaLabel">
            Texto do botão (opcional)
          </label>
          <input id="ctaLabel" name="ctaLabel" defaultValue={banner?.ctaLabel ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ctaUrl">
            Link do botão (opcional)
          </label>
          <input id="ctaUrl" name="ctaUrl" defaultValue={banner?.ctaUrl ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="desktopImage">
            Imagem desktop (URL)
          </label>
          <input
            id="desktopImage"
            name="desktopImage"
            required
            defaultValue={banner?.desktopImage}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="mobileImage">
            Imagem mobile (opcional)
          </label>
          <input id="mobileImage" name="mobileImage" defaultValue={banner?.mobileImage ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass} htmlFor="position">
            Ordem
          </label>
          <input
            id="position"
            name="position"
            type="number"
            defaultValue={banner?.position ?? 0}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="startsAt">
            Início (opcional)
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="date"
            defaultValue={toDateInput(banner?.startsAt)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endsAt">
            Fim (opcional)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="date"
            defaultValue={toDateInput(banner?.endsAt)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-fa-black/70">
        <input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} />
        Ativo
      </label>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar banner"}
      </Button>
    </form>
  );
}
