import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { listAdmins } from "@/modules/admin/admins-queries";
import { CreateAdminForm } from "@/components/admin/admins/create-admin-form";
import { RevokeAdminButton } from "@/components/admin/admins/revoke-admin-button";

export const metadata: Metadata = {
  title: "Administradores | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAdministratorsPage() {
  const [session, admins] = await Promise.all([auth(), listAdmins()]);
  const currentUserId = session?.user?.id;

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Administradores</h1>
      <p className="mt-1 text-sm text-fa-black/60">
        Contas com acesso ao painel administrativo. {admins.length} no total.
      </p>

      <section className="mt-6 rounded-sm border border-dashed border-fa-stone/30 p-6">
        <h2 className="font-display text-lg text-fa-black">Novo administrador</h2>
        <div className="mt-3">
          <CreateAdminForm />
        </div>
      </section>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {admins.map((adminUser) => (
              <tr key={adminUser.id} className="hover:bg-fa-off-white/60">
                <td className="px-4 py-3 text-fa-black">
                  {adminUser.name}
                  {adminUser.id === currentUserId && (
                    <span className="ml-2 text-xs text-fa-black/40">(você)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-fa-black/60">{adminUser.email}</td>
                <td className="px-4 py-3 text-fa-black/60">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(adminUser.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {adminUser.id !== currentUserId && (
                    <RevokeAdminButton userId={adminUser.id} name={adminUser.name} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
