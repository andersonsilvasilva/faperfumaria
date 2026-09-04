import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const FAMILIES = ["Amadeirado", "Floral", "Cítrico", "Oriental", "Gourmand", "Aquático"];

export function DiscoverEssenceSection() {
  return (
    <section className="bg-fa-off-white py-20">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative order-2 aspect-4/5 w-full overflow-hidden rounded-sm shadow-[0_30px_60px_-25px_rgba(11,11,11,0.4)] md:order-1">
          <Image
            src="/brand/store-perfumes.jpg"
            alt="Estante de perfumes selecionados da FA Perfumaria"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="order-1 md:order-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">Teste olfativo</p>
          <h2 className="mt-3 font-display text-3xl text-fa-black md:text-4xl">
            Qual perfume combina com você?
          </h2>
          <p className="mt-4 text-fa-black/70">
            Cítrico ou amadeirado? Suave ou marcante? Em 4 perguntas rápidas, descobrimos sua
            família olfativa ideal e selecionamos os perfumes com maior compatibilidade com o seu
            estilo.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {FAMILIES.map((family) => (
              <span
                key={family}
                className="rounded-full border border-fa-stone/30 bg-fa-white px-4 py-1.5 text-xs font-medium text-fa-black/70"
              >
                {family}
              </span>
            ))}
          </div>

          <ButtonLink href="/descubra-sua-essencia" className="mt-8">
            Fazer o teste olfativo
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
