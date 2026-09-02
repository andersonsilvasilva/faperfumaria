import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/store/account/profile-form";
import { PasswordForm } from "@/components/store/account/password-form";

export const metadata: Metadata = {
  title: "Meu perfil",
};

export default async function PerfilPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-fa-black">Meu perfil</h1>
        <div className="mt-6 max-w-md rounded-sm border border-fa-stone/15 bg-fa-white p-6">
          <ProfileForm name={user.name} phone={user.phone} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-fa-black">Segurança</h2>
        <div className="mt-4 max-w-md rounded-sm border border-fa-stone/15 bg-fa-white p-6">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
