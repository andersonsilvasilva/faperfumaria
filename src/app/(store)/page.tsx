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

// Revalida periodicamente para refletir mudanças de produtos em destaque feitas no Admin
// sem precisar de um novo deploy.
export const revalidate = 300;

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
