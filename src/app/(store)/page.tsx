import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">FA Perfumaria</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-fa-black md:text-5xl">
            Sua presença começa pela essência.
          </h1>
          <p className="mt-6 max-w-md text-fa-black/70">
            Fragrâncias escolhidas para quem entende que um perfume vai além do aroma. Ele revela
            personalidade, marca momentos e deixa uma impressão que permanece.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/loja">Explorar perfumes</ButtonLink>
            <ButtonLink href="/descubra-sua-essencia" variant="secondary">
              Encontrar minha fragrância
            </ButtonLink>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-xl">
          <Image
            src="/brand/store-perfumes.jpg"
            alt="Vitrine de perfumes selecionados pela FA Perfumaria"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </Container>
    </section>
  );
}
