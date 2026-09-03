import { HeroSection } from "@/components/store/home/hero-section";
import { BenefitsSection } from "@/components/store/home/benefits-section";
import { CategoriesSection } from "@/components/store/home/categories-section";
import { FeaturedProductsSection } from "@/components/store/home/featured-products-section";
import { ArabianBannerSection } from "@/components/store/home/arabian-banner-section";
import { BestSellersSection } from "@/components/store/home/bestsellers-section";
import { DiscoverEssenceSection } from "@/components/store/home/discover-essence-section";
import { GiftsSection } from "@/components/store/home/gifts-section";
import { AboutSection } from "@/components/store/home/about-section";
import { WhatsAppSection } from "@/components/store/home/whatsapp-section";
import { InstagramSection } from "@/components/store/home/instagram-section";
import { NewsletterSection } from "@/components/store/home/newsletter-section";

// Renderização sempre dinâmica (nunca estática/ISR): a Home não pode depender de uma conexão
// de banco bem-sucedida em tempo de BUILD — o banco de produção tem um limite baixo de conexões
// simultâneas (ver docs/database.md) e, com o site já rodando, um novo build competindo por
// conexão pode falhar (erro "pool failed to retrieve a connection from pool"). Mesmo padrão já
// usado em todas as outras páginas da loja.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <ArabianBannerSection />
      <BestSellersSection />
      <DiscoverEssenceSection />
      <GiftsSection />
      <AboutSection />
      <WhatsAppSection />
      <InstagramSection />
      <NewsletterSection />
    </>
  );
}
