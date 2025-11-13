import Image from "next/image";
import type { ReactNode } from "react";

type HeroStat = {
    value: string;
    label: string;
};

type PageHeroProps = {
    badge: string;
    title: string;
    description: string;
    image: string;
    actions?: ReactNode;
    footer?: ReactNode;
    stats?: HeroStat[];
    imagePriority?: boolean;
};

export function PageHero({ badge, title, description, image, actions, footer, stats, imagePriority = false }: PageHeroProps) {
    return (
        <section className="-mx-6 md:-mx-12 overflow-hidden border border-slate-900/20 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 text-white shadow-xl md:px-12">
            <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-2 lg:items-center">
                <div className="space-y-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">
                        {badge}
                    </span>
                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
                        <p className="text-lg text-emerald-50/90">{description}</p>
                    </div>
                    {actions}
                    {footer}
                </div>
                <div className="space-y-6">
                    <div className="relative h-80 w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl">
                        <Image src={image} alt={title} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority={imagePriority} />
                    </div>
                    {stats && stats.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-5 text-center backdrop-blur">
                                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-100/80">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

