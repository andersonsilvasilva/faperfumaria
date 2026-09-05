"use client";

import { useState } from "react";
import type { SalesPoint } from "@/modules/admin/dashboard-queries";
import { formatPrice } from "@/lib/format";

interface Period {
  key: string;
  label: string;
  data: SalesPoint[];
  dateFormat: Intl.DateTimeFormatOptions;
}

const WIDTH = 600;
const HEIGHT = 200;
const PADDING = 8;
const GRID_LINES = 4;

function parsePointDate(key: string): Date {
  return key.length > 7 ? new Date(`${key}T00:00:00`) : new Date(`${key}-01T00:00:00`);
}

function toCoords(values: number[]) {
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? (WIDTH - PADDING * 2) / (values.length - 1) : 0;
  return values.map((value, i) => ({
    x: PADDING + i * stepX,
    y: HEIGHT - PADDING - (value / max) * (HEIGHT - PADDING * 2),
  }));
}

/** Curva suave (Catmull-Rom convertido pra Bezier cúbica) em vez de linha reta segmentada. */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  const get = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))];

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function SalesLineChart({ periods }: { periods: Period[] }) {
  const [activeKey, setActiveKey] = useState(periods[0]?.key);
  const active = periods.find((p) => p.key === activeKey) ?? periods[0];
  if (!active) return null;

  const revenueCoords = toCoords(active.data.map((d) => d.total));
  const countCoords = toCoords(active.data.map((d) => d.count));
  const labelFormatter = new Intl.DateTimeFormat("pt-BR", active.dateFormat);
  const tooltipFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const labelIndexes =
    active.data.length <= 6
      ? active.data.map((_, i) => i)
      : [0, Math.floor((active.data.length - 1) / 2), active.data.length - 1];

  return (
    <div className="rounded-sm bg-fa-black p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-fa-white">Faturamento e vendas</h2>
        <div className="flex gap-1 rounded-sm bg-fa-white/10 p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              type="button"
              onClick={() => setActiveKey(period.key)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                period.key === active.key
                  ? "bg-fa-gold text-fa-black"
                  : "text-fa-white/60 hover:text-fa-white"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-48 w-full overflow-visible">
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const y = PADDING + (i * (HEIGHT - PADDING * 2)) / GRID_LINES;
            return <line key={i} x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.08" />;
          })}

          <path d={smoothPath(revenueCoords)} fill="none" stroke="#ddb95e" strokeWidth="2.5" />
          <path d={smoothPath(countCoords)} fill="none" stroke="#f7f5f2" strokeWidth="2" strokeOpacity="0.6" />

          {revenueCoords.map((p, i) => (
            <circle key={`r-${active.data[i].date}`} cx={p.x} cy={p.y} r="3" fill="#ddb95e">
              <title>
                {tooltipFormatter.format(parsePointDate(active.data[i].date))} — Faturamento:{" "}
                {formatPrice(active.data[i].total)}
              </title>
            </circle>
          ))}
          {countCoords.map((p, i) => (
            <circle key={`c-${active.data[i].date}`} cx={p.x} cy={p.y} r="2.5" fill="#f7f5f2">
              <title>
                {tooltipFormatter.format(parsePointDate(active.data[i].date))} — Pedidos: {active.data[i].count}
              </title>
            </circle>
          ))}
        </svg>

        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-fa-white/40">
          {labelIndexes.map((i) => (
            <span key={active.data[i].date}>{labelFormatter.format(parsePointDate(active.data[i].date))}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-fa-white/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-fa-gold-light" />
          Faturamento — {formatPrice(active.data.reduce((sum, d) => sum + d.total, 0))}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-fa-off-white" />
          Pedidos — {active.data.reduce((sum, d) => sum + d.count, 0)}x
        </span>
      </div>
    </div>
  );
}
