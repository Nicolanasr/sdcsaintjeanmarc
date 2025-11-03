import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDC Saint Jean Marc",
  description:
    "Discover the scouting spirit of SDC Saint Jean Marc. Learn about our sections, upcoming activities, and how to join our community.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#05070F] text-slate-100 antialiased`}
            >
                <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden ">
                    {children}
                </main>
            </body>
        </html>
    );
}
