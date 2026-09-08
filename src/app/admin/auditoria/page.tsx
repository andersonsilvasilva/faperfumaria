import type { Metadata } from "next";
import Link from "next/link";
import { listAuditLogs } from "@/modules/admin/audit-log-queries";

export const metadata: Metadata = {
  title: "Auditoria | Admin",
};

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  ORDER_STATUS_UPDATE: "Status do pedido atualizado",
  PRODUCT_CREATE: "Produto criado",
  PRODUCT_UPDATE: "Produto atualizado",
  PRODUCT_DELETE: "Produto excluído",
  REVIEW_STATUS_UPDATE: "Avaliação moderada",
  ADMIN_CREATE: "Administrador criado",
  ADMIN_ACCESS_REVOKED: "Acesso de administrador revogado",
};

const ENTITY_LINK_BUILDERS: Record<string, (entityId: string) => string> = {
  Product: (id) => `/admin/produtos/${id}`,
  Order: (id) => `/admin/pedidos/${id}`,
};

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { logs, total, pageCount } = await listAuditLogs({ page: currentPage });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-fa-black">Auditoria</h1>
        <p className="text-sm text-fa-black/60">{total} registro(s)</p>
      </div>
      <p className="mt-1 text-sm text-fa-black/60">
        Histórico de ações administrativas (quem mudou o quê e quando).
      </p>

      <div className="mt-6 overflow-x-auto rounded-sm border border-fa-stone/15 bg-fa-white shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-fa-stone/15 text-xs uppercase tracking-wide text-fa-black/50">
            <tr>
              <th className="px-4 py-3">Data/hora</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fa-stone/10">
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-fa-black/50">
                  Nenhum registro de auditoria ainda.
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const buildLink = ENTITY_LINK_BUILDERS[log.entityType];
              const hasChanges = log.beforeJson != null || log.afterJson != null;
              return (
                <tr key={log.id} className="hover:bg-fa-off-white/60">
                  <td className="px-4 py-3 whitespace-nowrap text-fa-black/60">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                      log.createdAt,
                    )}
                  </td>
                  <td className="px-4 py-3 text-fa-black">
                    {log.admin.name}
                    <span className="block text-xs text-fa-black/40">{log.admin.email}</span>
                  </td>
                  <td className="px-4 py-3 text-fa-black">{ACTION_LABELS[log.action] ?? log.action}</td>
                  <td className="px-4 py-3 text-fa-black/60">
                    {buildLink ? (
                      <Link href={buildLink(log.entityId)} className="text-fa-gold hover:underline">
                        {log.entityType} #{log.entityId.slice(-8)}
                      </Link>
                    ) : (
                      `${log.entityType} #${log.entityId.slice(-8)}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {hasChanges ? (
                      <details>
                        <summary className="cursor-pointer text-xs text-fa-black/60 hover:text-fa-gold">
                          Ver
                        </summary>
                        <pre className="mt-2 max-w-xs overflow-x-auto rounded-sm bg-fa-off-white p-2 text-[10px] text-fa-black/70">
                          {JSON.stringify({ antes: log.beforeJson, depois: log.afterJson }, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-fa-black/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/auditoria?page=${p}`}
              className={`rounded-sm px-3 py-1 ${
                p === currentPage ? "bg-fa-black text-fa-white" : "border border-fa-stone/30 text-fa-black/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
