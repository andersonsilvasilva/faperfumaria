"use client";

import { useActionState, useState } from "react";
import { updateGiftOptionsAction, type CartActionState } from "@/modules/cart/actions";

const initialState: CartActionState = { status: "idle" };

export function GiftOptionsForm({
  initialGiftWrap,
  initialGiftMessage,
}: {
  initialGiftWrap: boolean;
  initialGiftMessage: string;
}) {
  const [state, formAction, isPending] = useActionState(updateGiftOptionsAction, initialState);
  const [giftWrap, setGiftWrap] = useState(initialGiftWrap);

  return (
    <form action={formAction}>
      <label className="flex items-start gap-2 text-sm text-fa-black">
        <input
          type="checkbox"
          name="giftWrap"
          checked={giftWrap}
          onChange={(e) => setGiftWrap(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          É para presente? Embrulhamos com cuidado, sem custo adicional.
        </span>
      </label>

      {giftWrap && (
        <div className="mt-3">
          <label htmlFor="giftMessage" className="text-xs text-fa-black/60">
            Mensagem para o cartão (opcional)
          </label>
          <textarea
            id="giftMessage"
            name="giftMessage"
            defaultValue={initialGiftMessage}
            maxLength={300}
            rows={2}
            className="mt-1 w-full rounded-sm border border-fa-stone/40 px-3 py-2 text-sm focus:border-fa-gold focus:outline-none"
            placeholder="Ex.: Feliz aniversário! Com carinho, ..."
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-3 text-xs font-medium uppercase tracking-wide text-fa-black underline hover:text-fa-gold disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
      {state.status === "error" && <p className="mt-1 text-xs text-red-600">{state.message}</p>}
    </form>
  );
}
