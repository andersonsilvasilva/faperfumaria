type BadgeVariant = "gold" | "outline" | "dark" | "success" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  gold: "bg-fa-gold text-fa-black shadow-sm",
  outline: "border border-fa-stone/40 text-fa-black/70 bg-fa-white",
  dark: "bg-fa-black text-fa-off-white shadow-sm",
  success: "bg-green-50 text-green-700 border border-green-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
};

export function Badge({
  children,
  variant = "outline",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
