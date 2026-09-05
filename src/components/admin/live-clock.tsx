"use client";

import { useEffect, useState } from "react";

/** Estado inicial null pra evitar mismatch de SSR (o servidor não tem "agora do cliente"). */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Só roda no cliente, de propósito — o servidor não tem "agora do cliente" pra renderizar
    // sem risco de mismatch de hidratação (por isso o estado inicial é null, não new Date()).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  const date = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(now);

  return (
    <div className="text-right">
      <p className="font-display text-2xl tabular-nums text-fa-gold">{time}</p>
      <p className="text-xs uppercase tracking-wide text-fa-white/50">{date}</p>
    </div>
  );
}
