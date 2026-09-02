import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
};

export default function TermosDeUsoPage() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="setembro de 2026">
      <p>
        Estes Termos de Uso regulam o acesso e a utilização do site da FA Perfumaria. Ao navegar
        ou realizar uma compra, você concorda com as condições abaixo.
      </p>

      <h2 className="font-display text-xl text-fa-black">1. Cadastro e conta</h2>
      <p>
        Para acompanhar pedidos e favoritos, você pode criar uma conta com e-mail e senha. Você é
        responsável por manter suas credenciais em sigilo e por todas as atividades realizadas na
        sua conta.
      </p>

      <h2 className="font-display text-xl text-fa-black">2. Produtos, preços e disponibilidade</h2>
      <p>
        Fazemos o possível para manter preços e estoque atualizados. Em caso de erro evidente de
        preço ou indisponibilidade após a compra, entraremos em contato para oferecer alternativas
        ou o cancelamento do pedido com reembolso integral.
      </p>

      <h2 className="font-display text-xl text-fa-black">3. Pagamento</h2>
      <p>
        Os pagamentos são processados por parceiro especializado (Mercado Pago). A FA Perfumaria
        não armazena dados de cartão de crédito.
      </p>

      <h2 className="font-display text-xl text-fa-black">4. Propriedade intelectual</h2>
      <p>
        Marca, logotipo, textos e imagens deste site pertencem à FA Perfumaria ou são utilizados
        sob autorização, sendo vedada a reprodução sem consentimento prévio.
      </p>

      <h2 className="font-display text-xl text-fa-black">5. Legislação aplicável</h2>
      <p>
        Estes termos são regidos pelas leis brasileiras, incluindo o Código de Defesa do
        Consumidor (Lei nº 8.078/1990), com foro eleito na comarca de Bombinhas/SC para dirimir
        eventuais controvérsias.
      </p>

      <h2 className="font-display text-xl text-fa-black">6. Alterações</h2>
      <p>
        Podemos atualizar estes termos a qualquer momento; a versão vigente é sempre a publicada
        nesta página.
      </p>
    </LegalPage>
  );
}
