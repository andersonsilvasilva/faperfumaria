import Link from "next/link";

const links = [
  { label: "Visão geral", href: "/minha-conta" },
  { label: "Meus pedidos", href: "/minha-conta/pedidos" },
  { label: "Favoritos", href: "/minha-conta/favoritos" },
  { label: "Endereços", href: "/minha-conta/enderecos" },
  { label: "Meu perfil", href: "/minha-conta/perfil" },
];

export function AccountNav() {
  return (
    <nav aria-label="Navegação da conta" className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block rounded px-3 py-2 text-sm text-fa-black/80 hover:bg-fa-black/5 hover:text-fa-gold"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
