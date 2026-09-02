import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAddressAction, setDefaultAddressAction } from "@/modules/addresses/actions";

export const metadata: Metadata = {
  title: "Meus endereços",
};

export default async function EnderecosPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-fa-black">Meus endereços</h1>
        <ButtonLink href="/minha-conta/enderecos/novo" variant="secondary">
          Adicionar endereço
        </ButtonLink>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6 border border-dashed border-fa-stone/40 py-16 text-center">
          <p className="text-sm text-fa-black/60">Você ainda não cadastrou nenhum endereço.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-sm border border-fa-stone/15 bg-fa-white p-4 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium text-fa-black">{address.label}</p>
                {address.isDefault && <Badge variant="gold">Padrão</Badge>}
              </div>
              <p className="mt-2 text-fa-black/70">
                {address.recipientName}
                <br />
                {address.street}, {address.number}
                {address.complement ? ` — ${address.complement}` : ""}
                <br />
                {address.neighborhood} — {address.city}/{address.state}
                <br />
                CEP {address.zipCode}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <Link
                  href={`/minha-conta/enderecos/${address.id}`}
                  className="text-xs font-medium text-fa-black underline hover:text-fa-gold"
                >
                  Editar
                </Link>
                {!address.isDefault && (
                  <form action={setDefaultAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button type="submit" className="text-xs font-medium text-fa-black underline hover:text-fa-gold">
                      Tornar padrão
                    </button>
                  </form>
                )}
                <form action={deleteAddressAction}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <button type="submit" className="text-xs font-medium text-fa-black/50 underline hover:text-red-600">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
