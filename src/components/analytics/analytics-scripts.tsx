"use client";

import { Suspense } from "react";
import Script from "next/script";
import { MetaPixelPageView } from "@/components/analytics/meta-pixel-pageview";
import { useCookieConsent } from "@/lib/cookie-consent";

/**
 * Carrega GA4/Meta Pixel só quando as variáveis de ambiente estiverem configuradas E o visitante
 * tiver aceitado os cookies de análise/marketing (LGPD). É um Client Component de propósito: o
 * texto dos scripts nem chega ao navegador antes do "Aceitar" (NEXT_PUBLIC_* é embutido no
 * bundle do cliente em tempo de build). Em desenvolvimento (sem valores em .env), nada é
 * carregado. Ver docs/integrations.md.
 */
export function AnalyticsScripts() {
  const consent = useCookieConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (consent !== "accepted") return null;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
              window.gtag = gtag;`}
          </Script>
        </>
      )}
      {pixelId && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');`}
          </Script>
          <Suspense fallback={null}>
            <MetaPixelPageView />
          </Suspense>
        </>
      )}
    </>
  );
}
