import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function WhatsAppSection() {
  return (
    <section className="py-16">
      <Container className="max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-fa-gold uppercase">Fale com a FA</p>
        <h2 className="mt-3 font-display text-3xl text-fa-black">
          Ainda não sabe qual perfume escolher?
        </h2>
        <p className="mt-4 text-fa-black/70">
          Conte para nós o estilo de fragrância que você gosta, a ocasião ou até mesmo um perfume
          que já usa. Podemos ajudar você a encontrar novas opções.
        </p>
        <ButtonLink href="https://wa.me/5547988360043" className="mt-8">
          Falar pelo WhatsApp
        </ButtonLink>
      </Container>
    </section>
  );
}
