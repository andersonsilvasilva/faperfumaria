"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAdminAction, type AdminManageActionState } from "@/modules/admin/admins-actions";

const initialState: AdminManageActionState = { status: "idle" };
const inputClass =
  "mt-1 h-10 w-full rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none";

export function CreateAdminForm() {
  const [state, formAction, isPending] = useActionState(createAdminAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="name" className="text-xs font-medium text-fa-black/70">
          Nome
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-medium text-fa-black/70">
          E-mail
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="text-xs font-medium text-fa-black/70">
          Senha (mín. 8 caracteres)
        </label>
        <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
      </div>

      <div className="sm:col-span-3">
        {state.status === "error" && <p className="mb-2 text-sm text-red-600">{state.message}</p>}
        {state.status === "success" && <p className="mb-2 text-sm text-green-700">{state.message}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-fa-black px-5 py-2 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black disabled:opacity-50"
        >
          {isPending ? "Criando..." : "Criar administrador"}
        </button>
      </div>
    </form>
  );
}
