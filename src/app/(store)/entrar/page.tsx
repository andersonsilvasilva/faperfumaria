import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/components/store/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-8 shadow-[0_20px_45px_-25px_rgba(11,11,11,0.4)]">
        <h1 className="font-display text-3xl text-fa-black">Entrar na sua conta</h1>
        <p className="mt-2 text-sm text-fa-black/60">Acompanhe pedidos, favoritos e seus dados.</p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
