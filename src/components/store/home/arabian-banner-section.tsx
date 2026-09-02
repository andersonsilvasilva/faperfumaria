import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function ArabianBannerSection() {
  return (
    <section className="bg-fa-black py-20 text-fa-off-white">
      <Container className="max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">
          Intensidade & Sofisticação
        </p>
        <h2 className="mt-3 font-display text-3xl text-fa-off-white md:text-4xl">
          O universo da perfumaria árabe
        </h2>
        <p className="mt-4 text-fa-off-white/70">
          Fragrâncias intensas, envolventes e cheias de personalidade. Descubra composições que
          combinam tradição, riqueza olfativa e uma presença difícil de esquecer.
        </p>
        <ButtonLink href="/arabes" variant="secondary-inverse" className="mt-8">
          Conhecer perfumes árabes
        </ButtonLink>
      </Container>
    </section>
  );
}
