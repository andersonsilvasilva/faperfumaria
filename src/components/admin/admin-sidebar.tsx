import Link from "next/link";
import Image from "next/image";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produtos", href: "/admin/produtos" },
  { label: "Categorias", href: "/admin/categorias" },
  { label: "Marcas", href: "/admin/marcas" },
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Estoque", href: "/admin/estoque" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Avaliações", href: "/admin/avaliacoes" },
  { label: "Cupons", href: "/admin/cupons" },
  { label: "Banners", href: "/admin/banners" },
  { label: "Newsletter", href: "/admin/newsletter" },
  { label: "Configurações", href: "/admin/configuracoes" },
];

export function AdminSidebar() {
  return (
    <nav aria-label="Navegação do painel administrativo" className="space-y-1">
      <Link href="/admin" className="mb-4 flex justify-center">
        <Image
          src="/brand/logo-fa-perfumaria-dourada.png"
          alt="FA Perfumaria"
          width={200}
          height={200}
          priority
          className="object-contain"
        />
      </Link>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block rounded px-3 py-2 text-sm text-fa-off-white/80 hover:bg-fa-off-white/10 hover:text-fa-gold-light"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
