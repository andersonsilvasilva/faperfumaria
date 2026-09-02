"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

const mainNav = [
  { label: "Início", href: "/" },
  { label: "Masculinos", href: "/masculinos" },
  { label: "Femininos", href: "/femininos" },
  { label: "Árabes", href: "/arabes" },
  { label: "Decants", href: "/decants" },
  { label: "Kits & Presentes", href: "/kits" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Sobre a FA", href: "/sobre" },
];

const perfumesMegaMenu = {
  "Por público": [
    { label: "Masculinos", href: "/masculinos" },
    { label: "Femininos", href: "/femininos" },
    { label: "Unissex", href: "/unissex" },
  ],
  "Por estilo": [
    { label: "Árabes", href: "/arabes" },
    { label: "Importados", href: "/loja?estilo=importados" },
    { label: "Decants", href: "/decants" },
    { label: "Kits", href: "/kits" },
  ],
  "Por ocasião": [
    { label: "Dia a dia", href: "/loja?ocasiao=dia-a-dia" },
    { label: "Trabalho", href: "/loja?ocasiao=trabalho" },
    { label: "Encontros", href: "/loja?ocasiao=encontros" },
    { label: "Noite", href: "/loja?ocasiao=noite" },
    { label: "Festas", href: "/loja?ocasiao=festas" },
    { label: "Presentes", href: "/loja?ocasiao=presentes" },
  ],
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.2 4.8 5.6 4.2c2-.35 3.9.6 5 2.3 1.1-1.7 3-2.65 5-2.3 3.4.6 4.8 4 3.1 7.3C19 15.65 12 20 12 20Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 4-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-fa-gold/20 bg-fa-black/95 backdrop-blur">
      <div className="hidden border-b border-fa-white/10 py-2 text-center text-xs tracking-wide text-fa-off-white/80 md:block">
        Envios para todo o Brasil • Atendimento personalizado pelo WhatsApp
      </div>

      <Container className="flex h-20 items-center justify-between md:h-24">
        <Link href="/" aria-label="FA Perfumaria — página inicial" className="flex items-center">
          <span className="flex items-center rounded-sm bg-fa-off-white px-3 py-2 shadow-md">
            <Image
              src="/brand/logo-fa-perfumaria-transparente.png"
              alt="FA Perfumaria"
              width={192}
              height={128}
              priority
              className="h-12 w-auto md:h-16"
            />
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
          <div className="group relative">
            <Link
              href="/loja"
              className="text-sm font-medium tracking-wide text-fa-off-white transition-colors hover:text-fa-gold"
            >
              Perfumes
            </Link>
            <div className="invisible absolute left-1/2 top-full grid w-[560px] -translate-x-1/2 grid-cols-3 gap-6 border border-fa-stone/20 bg-fa-white p-6 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
              {Object.entries(perfumesMegaMenu).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fa-gold">{group}</p>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.label}>
                        <Link href={item.href} className="text-sm text-fa-black/80 hover:text-fa-gold">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {mainNav
            .filter((item) => item.label !== "Início")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-wide text-fa-off-white transition-colors hover:text-fa-gold"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-4 text-fa-off-white">
          <Link href="/buscar" aria-label="Buscar" className="hidden hover:text-fa-gold sm:block">
            <SearchIcon />
          </Link>
          <Link href="/minha-conta/favoritos" aria-label="Favoritos" className="hidden hover:text-fa-gold sm:block">
            <HeartIcon />
          </Link>
          <Link href="/minha-conta" aria-label="Minha conta" className="hidden hover:text-fa-gold sm:block">
            <UserIcon />
          </Link>
          <Link href="/carrinho" aria-label="Carrinho" className="hover:text-fa-gold">
            <BagIcon />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="hover:text-fa-gold lg:hidden"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <nav aria-label="Navegação móvel" className="border-t border-fa-stone/20 bg-fa-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded px-2 py-2.5 text-sm font-medium text-fa-black hover:bg-fa-off-white hover:text-fa-gold"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-6 border-t border-fa-stone/20 px-2 pt-4">
              <Link href="/buscar" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm">
                <SearchIcon /> Buscar
              </Link>
              <Link
                href="/minha-conta/favoritos"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm"
              >
                <HeartIcon /> Favoritos
              </Link>
              <Link href="/minha-conta" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm">
                <UserIcon /> Conta
              </Link>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
