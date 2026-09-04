import Link from "next/link";
import { Container } from "@/components/ui/container";

const columns = [
  {
    title: "Loja",
    links: [
      { label: "Masculinos", href: "/masculinos" },
      { label: "Femininos", href: "/femininos" },
      { label: "Árabes", href: "/arabes" },
      { label: "Decants", href: "/decants" },
      { label: "Kits & Presentes", href: "/kits" },
      { label: "Acessórios", href: "/acessorios" },
      { label: "Ofertas", href: "/ofertas" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Fale conosco", href: "/contato" },
      { label: "Minha conta", href: "/minha-conta" },
      { label: "Meus pedidos", href: "/minha-conta/pedidos" },
      { label: "Trocas e devoluções", href: "/trocas-e-devolucoes" },
      { label: "Envios e entregas", href: "/entregas" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre a FA", href: "/sobre" },
      { label: "Política de Privacidade", href: "/politica-de-privacidade" },
      { label: "Política de Cookies", href: "/politica-de-cookies" },
      { label: "Termos de Uso", href: "/termos-de-uso" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/elielaraujooficial/" },
  { label: "Facebook", href: "https://www.facebook.com/eliel.araujo.505569" },
  { label: "Threads", href: "https://www.threads.com/@elielaraujooficial" },
];

export function Footer() {
  return (
    <footer className="border-t border-fa-stone/20 bg-fa-black text-fa-off-white">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg text-fa-gold-light">FA Perfumaria</p>
          <p className="mt-3 max-w-xs text-sm text-fa-off-white/70">
            Fragrâncias escolhidas para transformar essência em presença.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-fa-off-white/80 hover:text-fa-gold-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">Contato</p>
          <address className="mt-4 space-y-1 text-sm not-italic text-fa-off-white/80">
            <p>FA Perfumaria</p>
            <p>R. Maracujá, 72</p>
            <p>Sertãozinho — Bombinhas/SC</p>
            <p>CEP 88215-000</p>
            <p className="pt-2">
              <a href="https://wa.me/5547988360043" className="hover:text-fa-gold-light">
                WhatsApp: +55 (47) 98836-0043
              </a>
            </p>
            <p>
              <a href="mailto:Elielaraujo852@outlook.com" className="hover:text-fa-gold-light">
                Elielaraujo852@outlook.com
              </a>
            </p>
          </address>

          <div className="mt-4 flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fa-off-white/80 hover:text-fa-gold-light"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-fa-off-white/10 py-5">
        <Container className="space-y-1 text-center">
          <p className="text-xs text-fa-off-white/50">
            © {new Date().getFullYear()} FA Perfumaria. Todos os direitos reservados.
          </p>
          <p className="text-xs text-fa-off-white/30">
            ©{" "}
            <a
              href="https://hightechtecnologia.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fa-off-white/60"
            >
              2026 HighTech Tecnologia Ltda
            </a>
            . Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
