"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setFormError("E-mail ou senha inválidos.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/minha-conta");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-fa-black">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1.5 w-full border border-fa-stone/40 bg-fa-white px-4 py-2.5 text-sm focus:border-fa-gold focus:outline-none"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-fa-black">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1.5 w-full border border-fa-stone/40 bg-fa-white px-4 py-2.5 text-sm focus:border-fa-gold focus:outline-none"
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
