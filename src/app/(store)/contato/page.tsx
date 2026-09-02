import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Fale conosco",
  description: "Canais de atendimento da FA Perfumaria: WhatsApp, e-mail e endereço da loja em Bombinhas/SC.",
};

export default function ContatoPage() {
  return (
    <Container className="max-w-2xl py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">Fale com a FA</p>
      <h1 className="mt-3 font-display text-3xl text-fa-black md:text-4xl">Fale conosco</h1>
      <p className="mt-4 text-fa-black/70">
        Conte para nós o estilo de fragrância que você gosta, a ocasião ou até mesmo um perfume
        que já usa. Podemos ajudar você a encontrar novas opções.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/50">WhatsApp</p>
          <p className="mt-2 text-fa-black">+55 (47) 98836-0043</p>
          <ButtonLink href="https://wa.me/5547988360043" className="mt-4">
            Falar pelo WhatsApp
          </ButtonLink>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/50">E-mail</p>
          <p className="mt-2">
            <a href="mailto:Elielaraujo852@outlook.com" className="text-fa-black hover:text-fa-gold">
              Elielaraujo852@outlook.com
            </a>
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/50">Loja</p>
          <address className="mt-2 not-italic text-fa-black">
            R. Maracujá, 72
            <br />
            Sertãozinho — Bombinhas/SC
            <br />
            CEP 88215-000
          </address>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/50">Redes sociais</p>
          <ul className="mt-2 space-y-1">
            <li>
              <a
                href="https://www.instagram.com/elielaraujooficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fa-black hover:text-fa-gold"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/eliel.araujo.505569"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fa-black hover:text-fa-gold"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.threads.com/@elielaraujooficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fa-black hover:text-fa-gold"
              >
                Threads
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
