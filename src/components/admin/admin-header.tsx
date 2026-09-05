import { signOut } from "@/lib/auth";
import { LiveClock } from "@/components/admin/live-clock";

export function AdminHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="border-b border-fa-stone/15 bg-fa-black px-8 py-6">
      <div className="flex items-center justify-end gap-4 border-b border-fa-white/10 pb-4">
        <div className="text-right">
          <p className="text-sm font-medium text-fa-white">{name}</p>
          <p className="text-xs text-fa-white/50">{email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-sm border border-fa-white/15 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-fa-white/70 hover:border-fa-gold hover:text-fa-gold"
          >
            Sair
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-fa-white">Olá, {name}</h1>
          <p className="mt-1 text-sm text-fa-white/50">Visão geral do desempenho do negócio.</p>
        </div>
        <LiveClock />
      </div>
    </header>
  );
}
