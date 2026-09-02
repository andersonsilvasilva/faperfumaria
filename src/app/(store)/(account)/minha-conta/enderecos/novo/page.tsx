import type { Metadata } from "next";
import { AddressForm } from "@/components/store/account/address-form";
import { createAddressAction } from "@/modules/addresses/actions";

export const metadata: Metadata = {
  title: "Novo endereço",
};

export default function NovoEnderecoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Novo endereço</h1>
      <div className="mt-6 max-w-xl rounded-sm border border-fa-stone/15 bg-fa-white p-6">
        <AddressForm action={createAddressAction} submitLabel="Salvar endereço" />
      </div>
    </div>
  );
}
