import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
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
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-fa-off-white text-fa-black font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
