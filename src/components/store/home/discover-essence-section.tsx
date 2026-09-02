import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function DiscoverEssenceSection() {
  return (
    <section className="bg-fa-off-white py-20">
      <Container className="max-w-2xl text-center">
        <h2 className="font-display text-3xl text-fa-black md:text-4xl">
          Qual perfume combina com você?
        </h2>
        <p className="mt-4 text-fa-black/70">
          Cítrico ou amadeirado? Suave ou marcante? Para o trabalho, para um encontro ou para
          aquela ocasião especial? Encontrar um perfume fica muito mais fácil quando você conhece
          o seu perfil.
        </p>
        <ButtonLink href="/descubra-sua-essencia" className="mt-8">
          Descobrir meu perfil olfativo
        </ButtonLink>
      </Container>
    </section>
  );
}
