import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function GiftsSection() {
  return (
    <section className="py-16">
      <Container className="grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
          <Image
            src="/brand/texture-wood.jpg"
            alt="Textura de madeira — kits e presentes FA Perfumaria"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">
            Presentear também é criar memórias
          </p>
          <h2 className="mt-3 font-display text-3xl text-fa-black">Um presente que permanece.</h2>
          <p className="mt-4 text-fa-black/70">
            Existem presentes que são lembrados pelo momento. Outros, pelo aroma. Encontre
            fragrâncias e combinações especiais para transformar sua escolha em uma experiência.
          </p>
          <ButtonLink href="/kits" className="mt-8">
            Ver kits & presentes
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
