import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { FavoritesProvider } from "@/components/store/favorites/favorites-provider";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <AnalyticsScripts />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </FavoritesProvider>
  );
}
