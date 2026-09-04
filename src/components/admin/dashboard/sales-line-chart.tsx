interface LineSeries {
  label: string;
  color: string;
  data: { date: string; value: number }[];
  format: (value: number) => string;
}

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 4;

function toPoints(data: { value: number }[]) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? (WIDTH - PADDING * 2) / (data.length - 1) : 0;
  return data.map((d, i) => {
    const x = PADDING + i * stepX;
    const y = HEIGHT - PADDING - (d.value / max) * (HEIGHT - PADDING * 2);
    return { x, y };
  });
}

/** Cada série é normalizada na própria escala (0 até o próprio máximo) — compara a forma da
 * tendência ao longo do período, não a magnitude absoluta entre séries de unidades diferentes
 * (R$ vs nº de pedidos). */
export function SalesLineChart({ series }: { series: LineSeries[] }) {
  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-40 w-full">
        {series.map((s) => {
          const points = toPoints(s.data);
          const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <g key={s.label}>
              <polyline points={linePoints} fill="none" stroke={s.color} strokeWidth="2" />
              {points.map((p, i) => (
                <circle key={s.data[i].date} cx={p.x} cy={p.y} r="2.5" fill={s.color}>
                  <title>
                    {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
                      new Date(s.data[i].date),
                    )}
                    {" — "}
                    {s.label}: {s.format(s.data[i].value)}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-fa-black/60">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
