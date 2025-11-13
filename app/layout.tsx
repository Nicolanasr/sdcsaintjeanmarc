import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const arabicSans = Cairo({
    variable: "--font-arabic",
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "SDC Saint Jean Marc",
    description:
        "Discover the scouting spirit of SDC Saint Jean Marc. Learn about our sections, upcoming activities, and how to join our community.",
    icons: {
        icon: "/images/favicon.ico",
        shortcut: "/images/favicon.ico",
        apple: "/images/apple-touch-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Head>
                <link rel="shortcut icon" href="/images/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
            </Head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${arabicSans.variable} min-h-screen bg-[#05070F] text-slate-100 antialiased`}
            >
                <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden ">
                    {children}
                </main>
            </body>
        </html>
    );
}
