import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = {
  title: "Trocas e Devoluções",
};

export default function TrocasEDevolucoesPage() {
  return (
    <LegalPage title="Trocas e Devoluções" updatedAt="setembro de 2026">
      <h2 className="font-display text-xl text-fa-black">Direito de arrependimento (compra online)</h2>
      <p>
        De acordo com o Art. 49 do Código de Defesa do Consumidor, você tem até <strong>7 (sete)
        dias corridos</strong> a partir do recebimento do produto para desistir da compra, sem
        necessidade de justificativa. Nesse caso, o produto deve estar lacrado, sem uso e na
        embalagem original.
      </p>

      <h2 className="font-display text-xl text-fa-black">Produto com defeito</h2>
      <p>
        Caso o produto apresente algum defeito ou não corresponda ao que foi anunciado, você tem
        até <strong>30 (trinta) dias corridos</strong> a partir do recebimento para solicitar
        troca, reparo ou reembolso, conforme o Art. 18 do Código de Defesa do Consumidor.
      </p>

      <h2 className="font-display text-xl text-fa-black">Como solicitar</h2>
      <p>
        Entre em contato pelo WhatsApp (+55 47 98836-0043) ou pelo e-mail
        Elielaraujo852@outlook.com, informando o número do pedido e o motivo da troca ou
        devolução. Vamos orientar sobre o envio do produto de volta.
      </p>

      <h2 className="font-display text-xl text-fa-black">Reembolso</h2>
      <p>
        Após recebermos e conferirmos o produto devolvido, o reembolso é processado pelo mesmo
        meio de pagamento utilizado na compra, respeitando os prazos do Mercado Pago e da
        operadora do cartão.
      </p>

      <h2 className="font-display text-xl text-fa-black">Condições que impedem a troca</h2>
      <p>
        Por questões de higiene, perfumes abertos ou com lacre violado só podem ser trocados ou
        devolvidos em caso de defeito comprovado — não se aplica o simples arrependimento a
        produtos já utilizados.
      </p>
    </LegalPage>
  );
}
