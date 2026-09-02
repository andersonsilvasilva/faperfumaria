import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Dashboard</h1>
      <p className="mt-2 text-sm text-fa-black/60">
        Métricas de vendas, faturamento e estoque chegam na Fase 5 — Admin.
      </p>
    </div>
  );
}
