import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function InstagramSection() {
  return (
    <section className="border-t border-fa-stone/15 bg-fa-white py-16">
      <Container className="max-w-2xl text-center">
        <h2 className="font-display text-3xl text-fa-black">Inspire-se com a FA</h2>
        <p className="mt-4 text-fa-black/70">
          Novidades, fragrâncias, sugestões e escolhas especiais para quem é apaixonado pelo
          universo da perfumaria.
        </p>
        <p className="mt-2 font-display text-lg text-fa-gold">@elielaraujooficial</p>
        <ButtonLink href="https://www.instagram.com/elielaraujooficial/" variant="secondary" className="mt-6">
          Seguir no Instagram
        </ButtonLink>
      </Container>
    </section>
  );
}
