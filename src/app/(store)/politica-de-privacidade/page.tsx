import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="setembro de 2026">
      <p>
        Esta Política de Privacidade descreve como a FA Perfumaria coleta, usa, armazena e
        protege os dados pessoais dos visitantes e clientes deste site, em conformidade com a Lei
        Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2 className="font-display text-xl text-fa-black">1. Quais dados coletamos</h2>
      <p>
        Coletamos dados que você nos fornece diretamente (nome, e-mail, telefone, CPF, endereço
        de entrega) ao criar uma conta, finalizar uma compra ou entrar em contato conosco. Também
        coletamos dados de navegação (páginas visitadas, produtos visualizados, dispositivo e
        cookies) para melhorar a experiência de compra.
      </p>

      <h2 className="font-display text-xl text-fa-black">2. Para que usamos seus dados</h2>
      <p>
        Usamos seus dados para processar pedidos, calcular frete, emitir nota fiscal, comunicar o
        status do pedido, prevenir fraudes, oferecer suporte e, quando você autorizar
        expressamente, enviar novidades e ofertas por e-mail.
      </p>

      <h2 className="font-display text-xl text-fa-black">3. Com quem compartilhamos</h2>
      <p>
        Compartilhamos dados estritamente necessários com parceiros que viabilizam a operação da
        loja: processador de pagamentos (Mercado Pago), transportadoras e serviços de e-mail
        transacional. Não vendemos seus dados a terceiros.
      </p>

      <h2 className="font-display text-xl text-fa-black">4. Seus direitos</h2>
      <p>
        Você pode solicitar a qualquer momento a confirmação, correção, exclusão ou portabilidade
        dos seus dados, bem como revogar consentimentos dados anteriormente (como o recebimento de
        newsletter). Para exercer esses direitos, entre em contato pelo e-mail
        Elielaraujo852@outlook.com.
      </p>

      <h2 className="font-display text-xl text-fa-black">5. Retenção e segurança</h2>
      <p>
        Mantemos seus dados pelo tempo necessário para cumprir obrigações legais e contratuais, e
        adotamos medidas técnicas e organizacionais razoáveis para proteger essas informações
        contra acesso não autorizado.
      </p>

      <h2 className="font-display text-xl text-fa-black">6. Alterações desta política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. A data da última atualização está
        indicada no topo desta página.
      </p>
    </LegalPage>
  );
}
