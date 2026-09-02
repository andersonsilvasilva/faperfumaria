import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/entrar?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-fa-black px-4 py-8">
        <AdminSidebar />
      </aside>
      <main className="flex-1 bg-fa-off-white p-8">{children}</main>
    </div>
  );
}
