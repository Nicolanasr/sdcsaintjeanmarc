import type { ReactNode } from "react";

type ContentSectionProps = {
	id?: string;
	children: ReactNode;
	bordered?: boolean;
	padded?: boolean;
	backgroundClass?: string;
	borderClassName?: string;
	className?: string;
	maxWidthClass?: string;
};

export function ContentSection({
	id,
	children,
	bordered = false,
	padded = false,
	backgroundClass,
	borderClassName,
	className = "",
	maxWidthClass = "max-w-6xl",
}: ContentSectionProps) {
	const base = `mx-auto w-full ${maxWidthClass}`.trim();
	const borderClass = bordered
		? `rounded-3xl border shadow-sm ${borderClassName ?? "border-slate-200"}`
		: "";
	const background = backgroundClass ?? (bordered ? "bg-white/90" : "");
	const padding = padded ? "p-6 md:p-8" : "";
	const classes = [base, borderClass, background, padding, className].filter(Boolean).join(" ").trim();

	return (
		<section id={id} className={classes}>
			{children}
		</section>
	);
}
