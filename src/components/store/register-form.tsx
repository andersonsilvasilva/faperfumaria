"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { registerAction, type RegisterActionState } from "@/modules/auth/register-actions";

const initialState: RegisterActionState = { status: "idle" };

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <form action={formAction} className="space-y-5">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-fa-black">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="mt-1.5 w-full border border-fa-stone/40 bg-fa-white px-4 py-2.5 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-fa-black">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full border border-fa-stone/40 bg-fa-white px-4 py-2.5 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-fa-black">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1.5 w-full border border-fa-stone/40 bg-fa-white px-4 py-2.5 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-fa-black">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1.5 w-full border border-fa-stone/40 bg-fa-white px-4 py-2.5 text-sm focus:border-fa-gold focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-fa-black/60">
        <input type="checkbox" name="terms" required className="mt-0.5" />
        Li e aceito os{" "}
        <Link href="/termos-de-uso" className="underline hover:text-fa-gold">
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href="/politica-de-privacidade" className="underline hover:text-fa-gold">
          Política de Privacidade
        </Link>
        .
      </label>

      <label className="flex items-start gap-2 text-xs text-fa-black/60">
        <input type="checkbox" name="marketing" className="mt-0.5" />
        Quero receber novidades e ofertas da FA Perfumaria por e-mail.
      </label>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
