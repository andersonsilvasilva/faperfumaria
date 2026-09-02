import type { Metadata } from "next";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default async function AccountDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Olá, {session?.user?.name}</h1>
      <p className="mt-2 text-sm text-fa-black/60">
        Acompanhe seus pedidos, favoritos e dados a partir do menu ao lado.
      </p>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <button type="submit" className="text-sm font-medium text-fa-black underline hover:text-fa-gold">
          Sair da conta
        </button>
      </form>
    </div>
  );
}
