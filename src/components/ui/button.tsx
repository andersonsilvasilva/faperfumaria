import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "secondary-inverse" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-fa-black text-fa-white hover:bg-fa-gold hover:text-fa-black",
  secondary: "border border-fa-black text-fa-black hover:bg-fa-black hover:text-fa-white",
  "secondary-inverse": "border border-fa-gold text-fa-gold hover:bg-fa-gold hover:text-fa-black",
  ghost: "text-fa-black hover:text-fa-gold",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide uppercase px-6 py-3 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({ href, variant = "primary", className = "", children }: ButtonLinkProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
