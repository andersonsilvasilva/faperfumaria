import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = {
  title: "Política de Cookies",
};

export default function PoliticaDeCookiesPage() {
  return (
    <LegalPage title="Política de Cookies" updatedAt="setembro de 2026">
      <p>
        Cookies são pequenos arquivos armazenados no seu navegador que ajudam o site a funcionar
        corretamente e a entender como você o utiliza.
      </p>

      <h2 className="font-display text-xl text-fa-black">Cookies que utilizamos</h2>
      <p>
        <strong>Essenciais:</strong> necessários para o funcionamento do site, como manter os
        itens no seu carrinho e a sua sessão de login. Não podem ser desativados.
      </p>
      <p>
        <strong>Analíticos:</strong> quando configurados (Google Analytics), nos ajudam a entender
        quais páginas e produtos têm mais interesse, de forma agregada e anônima.
      </p>
      <p>
        <strong>Marketing:</strong> quando configurados (Meta Pixel), ajudam a medir a efetividade
        de anúncios em redes sociais.
      </p>

      <h2 className="font-display text-xl text-fa-black">Como gerenciar cookies</h2>
      <p>
        Você pode bloquear ou apagar cookies a qualquer momento nas configurações do seu
        navegador. Note que desativar cookies essenciais pode afetar o funcionamento do carrinho
        e do checkout.
      </p>

      <p>
        Para saber mais sobre como tratamos seus dados, consulte a nossa{" "}
        <Link href="/politica-de-privacidade" className="text-fa-gold hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </LegalPage>
  );
}
