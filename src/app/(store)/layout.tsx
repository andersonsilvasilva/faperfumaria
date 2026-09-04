import { headers } from "next/headers";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { FavoritesProvider } from "@/components/store/favorites/favorites-provider";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { MaintenancePage } from "@/components/store/maintenance-page";
import { getMaintenanceMode } from "@/modules/settings/maintenance";
import { getSiteBackground } from "@/modules/settings/site-background";
import { BackToTopButton } from "@/components/store/back-to-top-button";
import { auth } from "@/lib/auth";

// Rotas que continuam acessíveis mesmo em manutenção — sem isso, um admin deslogado ficaria
// sem como entrar e desativar o modo de manutenção.
const MAINTENANCE_ALLOWED_PATHS = new Set(["/entrar", "/cadastro"]);

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [maintenance, session, pathname, background] = await Promise.all([
    getMaintenanceMode(),
    auth(),
    headers().then((h) => h.get("x-pathname") ?? ""),
    getSiteBackground(),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";
  const isBlocked = maintenance.enabled && !isAdmin && !MAINTENANCE_ALLOWED_PATHS.has(pathname);
  const backgroundStyle = { background: `linear-gradient(180deg, ${background.colorStart}, ${background.colorEnd})` };

  if (isBlocked) {
    return (
      <div className="flex min-h-screen flex-col" style={backgroundStyle}>
        <AnalyticsScripts />
        <MaintenancePage message={maintenance.message} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={backgroundStyle}>
      <FavoritesProvider>
        <AnalyticsScripts />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTopButton />
      </FavoritesProvider>
    </div>
  );
}
