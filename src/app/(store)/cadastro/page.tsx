import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { RegisterForm } from "@/components/store/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const loginHref = callbackUrl ? `/entrar?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/entrar";

  return (
    <Container className="flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-8 shadow-[0_20px_45px_-25px_rgba(11,11,11,0.4)]">
        <h1 className="font-display text-3xl text-fa-black">Criar conta</h1>
        <p className="mt-2 text-sm text-fa-black/60">
          Acompanhe pedidos, salve favoritos e agilize suas próximas compras.
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-fa-black/60">
          Já tem conta?{" "}
          <Link href={loginHref} className="font-medium text-fa-gold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </Container>
  );
}
