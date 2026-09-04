"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createReviewAction, type ReviewActionState } from "@/modules/reviews/actions";
import type { ReviewEligibility } from "@/modules/reviews/queries";

const initialState: ReviewActionState = { status: "idle" };

export function ReviewForm({
  productId,
  productSlug,
  eligibility,
}: {
  productId: string;
  productSlug: string;
  eligibility: ReviewEligibility;
}) {
  const [state, formAction, isPending] = useActionState(createReviewAction, initialState);

  if (state.status === "success") {
    return <p className="text-sm text-green-700">{state.message}</p>;
  }

  if (eligibility.reason === "not-logged-in") {
    return (
      <p className="text-sm text-fa-black/60">
        <Link href="/entrar" className="text-fa-gold underline">
          Entre na sua conta
        </Link>{" "}
        para avaliar este produto.
      </p>
    );
  }

  if (eligibility.reason === "already-reviewed") {
    return <p className="text-sm text-fa-black/60">Você já avaliou este produto. Obrigado!</p>;
  }

  if (eligibility.reason === "no-purchase") {
    return (
      <p className="text-sm text-fa-black/60">
        Só clientes com compra confirmada deste produto podem avaliá-lo.
      </p>
    );
  }

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      <div>
        <span className="text-xs font-medium text-fa-black/70">Sua nota</span>
        <div className="mt-1 flex gap-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex items-center gap-1 text-sm text-fa-black/70">
              <input type="radio" name="rating" value={value} required defaultChecked={value === 5} />
              {value}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-xs font-medium text-fa-black/70">
          Comentário
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          minLength={10}
          rows={4}
          placeholder="Conte como foi sua experiência com este produto..."
          className="mt-1 w-full rounded-sm border border-fa-stone/40 px-3 py-2 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </form>
  );
}
