import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">FA Perfumaria</p>
          <h1 className="mt-4 font-display text-2xl leading-tight text-fa-black md:text-5xl">
            Sua presença começa pela
            <br />
            essência.
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

        <div className="relative">
          {/* brilho dourado suave atrás da imagem */}
          <div
            aria-hidden
            className="absolute -inset-8 -z-10 rounded-full bg-fa-gold/25 blur-3xl"
          />

          <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm shadow-[0_40px_70px_-20px_rgba(11,11,11,0.45)] ring-1 ring-fa-gold/20">
            <Image
              src="/brand/hero-destaque.png"
              alt="Perfume em destaque sobre mármore, com estante de fragrâncias ao fundo"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            {/* sombreamento sutil para dar profundidade sem competir com o produto */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-fa-black/30 via-transparent to-fa-black/10" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-fa-white/10" />
          </div>

          {/* sombra de contato no "chão", reforçando a sensação de profundidade */}
          <div
            aria-hidden
            className="absolute -bottom-6 left-1/2 h-10 w-4/5 -translate-x-1/2 rounded-full bg-fa-black/25 blur-2xl"
          />
        </div>
      </Container>
    </section>
  );
}
