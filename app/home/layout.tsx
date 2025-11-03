import type { ReactNode } from "react";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <Providers>
            <div className="flex min-h-screen w-full flex-col bg-neutral-100 text-slate-900">
                <SiteHeader />
                <main className="flex-1 px-6 md:px-12">
                    {children}
                </main>
                <SiteFooter />
            </div>
        </Providers>
    );
}
