import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressForm } from "@/components/store/account/address-form";
import { updateAddressAction } from "@/modules/addresses/actions";

export const metadata: Metadata = {
  title: "Editar endereço",
};

export default async function EditarEnderecoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== session!.user.id) notFound();

  const boundAction = updateAddressAction.bind(null, address.id);

  return (
    <div>
      <h1 className="font-display text-2xl text-fa-black">Editar endereço</h1>
      <div className="mt-6 max-w-xl rounded-sm border border-fa-stone/15 bg-fa-white p-6">
        <AddressForm action={boundAction} initialValues={address} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
