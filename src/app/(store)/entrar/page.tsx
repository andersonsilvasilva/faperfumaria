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
      <h1 className="font-display text-3xl text-fa-black">Entrar na sua conta</h1>
      <p className="mt-2 text-sm text-fa-black/60">Acompanhe pedidos, favoritos e seus dados.</p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </Container>
  );
}
