import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ActivitiesLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-neutral-100 text-slate-900">
            <SiteHeader />
            <main className="flex-1 mt-24">{children}</main>
            <SiteFooter />
        </div>
    );
}
