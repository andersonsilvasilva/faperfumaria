import Image from "next/image";
import Link from "next/link";

export function MaintenancePage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-fa-off-white px-6 text-center">
      <Image
        src="/brand/logo-fa-perfumaria-dourada.png"
        alt="FA Perfumaria"
        width={140}
        height={140}
        className="h-auto w-32"
        priority
      />
      <h1 className="mt-8 font-display text-2xl text-fa-black">Voltamos já</h1>
      <p className="mt-3 max-w-md text-sm text-fa-black/70">{message}</p>
      <a
        href="https://wa.me/5547988360043"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center rounded-sm bg-fa-black px-6 py-3 text-xs font-medium uppercase tracking-wide text-fa-white hover:bg-fa-gold hover:text-fa-black"
      >
        Falar pelo WhatsApp
      </a>
      <Link
        href="/entrar?callbackUrl=/admin"
        className="mt-6 text-xs text-fa-black/40 underline hover:text-fa-gold"
      >
        Entrar como administrador
      </Link>
    </div>
  );
}
