import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { AccountNav } from "@/components/store/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/entrar?callbackUrl=/minha-conta");
  }

  return (
    <Container className="grid gap-10 py-12 md:grid-cols-[220px_1fr]">
      <AccountNav />
      <div>{children}</div>
    </Container>
  );
}
