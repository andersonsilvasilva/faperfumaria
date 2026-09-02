import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre a FA",
  description: "Conheça a história e os valores da FA Perfumaria, boutique de perfumaria em Bombinhas/SC.",
};

export default function SobrePage() {
  return (
    <Container className="max-w-3xl py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">Sobre a FA</p>
      <h1 className="mt-3 font-display text-3xl text-fa-black md:text-4xl">
        Perfume é memória. Presença. Identidade.
      </h1>

      <div className="relative mt-8 aspect-16/9 w-full overflow-hidden rounded-sm shadow-lg">
        <Image
          src="/brand/store-perfumes.jpg"
          alt="Vitrine da FA Perfumaria"
          fill
          className="object-cover"
          sizes="768px"
        />
      </div>

      <div className="mt-8 space-y-5 text-fa-black/80">
        <p>
          Na FA Perfumaria, acreditamos que escolher uma fragrância é também escolher como
          queremos ser lembrados.
        </p>
        <p>
          Por isso, buscamos oferecer uma seleção de perfumes para diferentes estilos, ocasiões e
          personalidades, unindo atendimento próximo a uma experiência de compra simples e
          elegante.
        </p>
        <p>
          Mais do que apresentar fragrâncias, queremos ajudar você a encontrar aquela que traduz
          a sua essência.
        </p>
        <p>
          A FA Perfumaria nasceu em Bombinhas, Santa Catarina, e hoje atende clientes de todo o
          Brasil — sempre com a mesma atenção de uma boutique de bairro.
        </p>
      </div>

      <ButtonLink href="https://wa.me/5547988360043" className="mt-10">
        Falar pelo WhatsApp
      </ButtonLink>
    </Container>
  );
}
