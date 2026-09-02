import { Container } from "@/components/ui/container";

const benefits = [
  {
    title: "Curadoria especial",
    text: "Perfumes escolhidos para diferentes estilos, momentos e personalidades.",
  },
  {
    title: "Atendimento personalizado",
    text: "Conte com a FA para encontrar uma fragrância que realmente combine com você.",
  },
  {
    title: "Compra fácil e segura",
    text: "Uma experiência simples, transparente e pensada para sua tranquilidade.",
  },
  {
    title: "Entrega com cuidado",
    text: "Seu pedido preparado com atenção desde a escolha até o envio.",
  },
];

export function BenefitsSection() {
  return (
    <section className="border-y border-fa-stone/15 bg-fa-white py-14">
      <Container className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={benefit.title}>
            <p className="font-display text-lg text-fa-black">{benefit.title}</p>
            <p className="mt-2 text-sm text-fa-black/60">{benefit.text}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
