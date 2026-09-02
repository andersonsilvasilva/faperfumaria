export function SalesBarChart({ data }: { data: { date: string; total: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d) => (
        <div key={d.date} className="group relative flex-1">
          <div
            className="w-full rounded-t-sm bg-fa-gold/70 transition-colors group-hover:bg-fa-gold"
            style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }}
          />
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-fa-black px-2 py-1 text-[10px] text-fa-white group-hover:block">
            {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(d.date))}:{" "}
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(d.total)}
          </div>
        </div>
      ))}
    </div>
  );
}
