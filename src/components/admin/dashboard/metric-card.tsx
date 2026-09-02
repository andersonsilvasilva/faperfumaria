export function MetricCard({
  label,
  value,
  hint,
  danger = false,
}: {
  label: string;
  value: string;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-sm border border-fa-stone/15 bg-fa-white p-5 shadow-[0_20px_45px_-30px_rgba(11,11,11,0.4)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-fa-black/50">{label}</p>
      <p className={`mt-2 font-display text-2xl ${danger ? "text-red-600" : "text-fa-black"}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-fa-black/40">{hint}</p>}
    </div>
  );
}
