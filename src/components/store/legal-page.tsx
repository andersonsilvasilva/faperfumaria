import Link from "next/link";
import { Container } from "@/components/ui/container";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="max-w-2xl py-16">
      <nav aria-label="Breadcrumb" className="text-xs text-fa-black/50">
        <Link href="/" className="hover:text-fa-gold">
          Início
        </Link>{" "}
        / <span className="text-fa-black">{title}</span>
      </nav>

      <h1 className="mt-3 font-display text-3xl text-fa-black">{title}</h1>
      {updatedAt && <p className="mt-1 text-xs text-fa-black/50">Última atualização: {updatedAt}</p>}

      <div className="prose-fa mt-8 space-y-5 text-sm leading-relaxed text-fa-black/80">{children}</div>
    </Container>
  );
}
