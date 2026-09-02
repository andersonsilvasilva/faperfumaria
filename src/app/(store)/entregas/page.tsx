import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = {
  title: "Envios e Entregas",
};

export default function EntregasPage() {
  return (
    <LegalPage title="Envios e Entregas" updatedAt="setembro de 2026">
      <h2 className="font-display text-xl text-fa-black">Formas de entrega</h2>
      <p>
        <strong>Retirada na loja</strong> — grátis, na FA Perfumaria (R. Maracujá, 72,
        Sertãozinho, Bombinhas/SC). Avisaremos por WhatsApp assim que o pedido estiver pronto.
      </p>
      <p>
        <strong>Entrega local</strong> — para os municípios de Bombinhas, Porto Belo e Itapema,
        com valor e prazo calculados no carrinho.
      </p>
      <p>
        <strong>Frete nacional</strong> — para todo o Brasil, via transportadora parceira. O
        prazo e o valor são calculados no checkout a partir do seu CEP.
      </p>

      <h2 className="font-display text-xl text-fa-black">Prazo de processamento</h2>
      <p>
        Pedidos pagos até às 16h em dias úteis são preparados no mesmo dia; os demais, no
        próximo dia útil. Após o pagamento ser aprovado, você recebe atualizações do status pelo
        e-mail e, quando disponível, o código de rastreamento.
      </p>

      <h2 className="font-display text-xl text-fa-black">Acompanhamento do pedido</h2>
      <p>
        Você pode acompanhar o status do seu pedido a qualquer momento em{" "}
        <span className="font-medium text-fa-black">Minha Conta → Meus Pedidos</span>, ou entrando
        em contato pelo WhatsApp.
      </p>
    </LegalPage>
  );
}
