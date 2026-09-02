import Link from "next/link";
import { Container } from "@/components/ui/container";

const categories = [
  {
    title: "Perfumes Masculinos",
    text: "Presença, elegância e personalidade em fragrâncias que deixam sua marca.",
    href: "/masculinos",
  },
  {
    title: "Perfumes Femininos",
    text: "Fragrâncias delicadas, sofisticadas, intensas e envolventes para diferentes momentos.",
    href: "/femininos",
  },
  {
    title: "Perfumes Árabes",
    text: "Composições intensas e marcantes para quem busca fragrâncias com personalidade.",
    href: "/arabes",
  },
  {
    title: "Decants",
    text: "Experimente novas fragrâncias em pequenas quantidades antes de escolher seu próximo perfume.",
    href: "/decants",
  },
  {
    title: "Kits & Presentes",
    text: "Escolhas especiais para transformar fragrâncias em experiências memoráveis.",
    href: "/kits",
  },
  {
    title: "Ofertas",
    text: "Condições especiais em fragrâncias selecionadas.",
    href: "/ofertas",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl text-fa-black">
            Encontre a fragrância para o seu momento
          </h2>
          <p className="mt-3 text-fa-black/70">
            Explore nossa seleção e descubra perfumes capazes de traduzir diferentes estilos,
            personalidades e ocasiões.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group border border-fa-stone/20 bg-fa-white p-6 transition-colors hover:border-fa-gold"
            >
              <p className="font-display text-lg text-fa-black group-hover:text-fa-gold">
                {category.title}
              </p>
              <p className="mt-2 text-sm text-fa-black/60">{category.text}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
