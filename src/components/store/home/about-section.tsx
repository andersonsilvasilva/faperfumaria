import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function AboutSection() {
  return (
    <section className="border-t border-fa-stone/15 bg-fa-white py-20">
      <Container className="max-w-2xl text-center">
        <h2 className="font-display text-3xl text-fa-black md:text-4xl">
          Perfume é memória. Presença. Identidade.
        </h2>
        <p className="mt-4 text-fa-black/70">
          Na FA Perfumaria, acreditamos que escolher uma fragrância é também escolher como
          queremos ser lembrados.
        </p>
        <p className="mt-4 text-fa-black/70">
          Por isso, buscamos oferecer uma seleção de perfumes para diferentes estilos, ocasiões e
          personalidades, unindo atendimento próximo a uma experiência de compra simples e
          elegante.
        </p>
        <p className="mt-4 text-fa-black/70">
          Mais do que apresentar fragrâncias, queremos ajudar você a encontrar aquela que traduz
          a sua essência.
        </p>
        <ButtonLink href="/sobre" variant="secondary" className="mt-8">
          Conheça a FA Perfumaria
        </ButtonLink>
      </Container>
    </section>
  );
}
