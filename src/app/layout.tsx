import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FA Perfumaria | Sua presença começa pela essência",
    template: "%s | FA Perfumaria",
  },
  description:
    "Fragrâncias escolhidas para quem entende que um perfume vai além do aroma. Perfumaria premium em Bombinhas/SC, com envio para todo o Brasil.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FA Perfumaria",
    title: "FA Perfumaria | Sua presença começa pela essência",
    description:
      "Fragrâncias escolhidas para quem entende que um perfume vai além do aroma.",
    images: [
      {
        url: "/brand/logo-fa-perfumaria.jpg",
        width: 1280,
        height: 853,
        alt: "FA Perfumaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/logo-fa-perfumaria.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FA Perfumaria",
  url: siteUrl,
  logo: `${siteUrl}/brand/logo-fa-perfumaria-dourada.png`,
  email: "Elielaraujo852@outlook.com",
  telephone: "+55-47-98836-0043",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Maracujá, 72 - Sertãozinho",
    addressLocality: "Bombinhas",
    addressRegion: "SC",
    postalCode: "88215-000",
    addressCountry: "BR",
  },
  sameAs: [
    "https://www.instagram.com/elielaraujooficial/",
    "https://www.facebook.com/eliel.araujo.505569",
    "https://www.threads.com/@elielaraujooficial",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FA Perfumaria",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/buscar?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-fa-off-white text-fa-black font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
