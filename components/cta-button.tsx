import Link from "next/link";

type CTAButtonVariant = "solid" | "outline" | "light" | "ghost";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: CTAButtonVariant;
  className?: string;
};

const variantClasses: Record<CTAButtonVariant, string> = {
  solid: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  outline:
    "border border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:text-emerald-800",
  light: "bg-white text-emerald-700 shadow-sm hover:bg-slate-100",
  ghost:
    "border border-white/70 text-white hover:border-white hover:bg-white/10",
};

export function CTAButton({
  href,
  children,
  variant = "solid",
  className = "",
}: CTAButtonProps) {
  const base =
    "rounded-full px-6 py-3 text-base font-semibold transition hover:-translate-y-0.5";
  const styles = `${base} ${variantClasses[variant]} ${className}`;
  return (
    <Link href={href} className={styles}>
      {children}
    </Link>
  );
}
