"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Award, Search, Trophy, Calendar, Sparkles } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";

interface Winner {
  id: number;
  prizeName: string;
  drawnAt: string;
  ticketId: number;
  buyerName: string;
  buyerPhone: string;
  teamName: string;
}

function WinnersContent() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadWinners() {
      try {
        const res = await fetch("/api/public/winners");
        if (res.ok) {
          const data = await res.json();
          setWinners(data.winners || []);
        }
      } catch (err) {
        console.error("Error loading winners:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWinners();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scout-beige">
        <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
      </div>
    );
  }

  const filteredWinners = winners.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      w.buyerName.toLowerCase().includes(q) ||
      w.prizeName.toLowerCase().includes(q) ||
      String(w.ticketId).includes(q) ||
      w.teamName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-scout-beige text-scout-charcoal">
      {/* Header Banner */}
      <header className="bg-scout-navy text-white py-4 px-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-scout-green-light/10 blur-xl scale-150" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-2">
          <img
            src="/sdc-logo-removebg-preview.png"
            alt="Scouts des Cèdres Logo"
            className="w-36 h-36 object-contain drop-shadow-md filter invert-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/sdc-logo.jpeg";
            }}
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-scout-gold tracking-tight">
              {isAr ? "كشافة الأرز | الفائزون بالسحب" : "Scouts des Cèdres | Raffle Winners"}
            </h1>
            <p className="text-xs text-white/70 mt-1.5 font-semibold tracking-wide">
              {isAr ? "النتائج الرسمية لقرعة سحب بطولة الكأس" : "Official draw results for the Scout World Cup Raffle"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 mt-6 pb-12">
        {/* Search bar */}
        <div className="glass-panel p-4 rounded-xl shadow-sm bg-white border border-scout-gold/10">
          <form onSubmit={(e) => e.preventDefault()} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث بالاسم، الجائزة، أو رقم التذكرة..." : "Search by name, prize, or ticket number..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm font-semibold text-scout-navy placeholder:text-scout-charcoal/40"
            />
            <Search className="w-5 h-5 text-scout-charcoal/40 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Winners list */}
        <div className="space-y-4">
          {filteredWinners.length === 0 ? (
            <div className="glass-panel p-12 text-center text-scout-charcoal/50 rounded-2xl bg-white/70 border border-dashed">
              <Trophy className="w-12 h-12 text-scout-charcoal/30 mx-auto mb-3" />
              <p className="text-sm font-bold">
                {searchQuery
                  ? (isAr ? "لم يتم العثور على نتائج للبحث." : "No results match your search.")
                  : (isAr ? "لم يتم إجراء أي سحوبات بعد." : "No raffle drawings executed yet.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWinners.map((w) => (
                <div
                  key={w.id}
                  className="glass-panel p-5 rounded-2xl shadow-md border-l-4 border-scout-gold bg-white relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 p-3 text-scout-gold opacity-10">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-scout-gold/15 text-scout-navy text-[11px] font-bold rounded-lg mb-3">
                      <Award className="w-3.5 h-3.5" />
                      {w.prizeName}
                    </span>
                    <h3 className="text-lg font-bold text-scout-navy">{w.buyerName}</h3>
                    <p className="text-xs text-scout-charcoal/60 font-mono mt-0.5">{w.buyerPhone}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]">
                    <span className="bg-scout-navy/5 text-scout-navy px-2 py-0.5 rounded font-mono font-bold">
                      Ticket #{w.ticketId}
                    </span>
                    <span className="bg-scout-navy/5 text-scout-navy px-2 py-0.5 rounded font-bold uppercase">
                      {w.teamName}
                    </span>
                    <span className="text-scout-charcoal/60 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-scout-gold" />
                      {new Date(w.drawnAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Media & Verification Notice */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl shadow-md bg-white border border-scout-gold/20 text-center space-y-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-sm font-bold font-display text-scout-navy flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-scout-gold" />
              <span>{isAr ? "مطابقة وتثبيت الفائزين" : "Winner Validation Notice"}</span>
            </h3>
            <p className="text-xs text-scout-charcoal/80 mt-1">
              {isAr
                ? "يجب على الفائزين التواصل مع قادة الفوج لتأكيد استلام الجوائز والتأكد من متابعة الحسابات الرسمية للفوج."
                : "Winners must contact unit leaders to claim their prize. Following our social handles is required to validate prize eligibility."}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="https://www.facebook.com/SDCGroupeSJM/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-scout-navy/5 hover:bg-scout-navy text-scout-navy hover:text-white flex items-center justify-center transition"
            >
              <FaFacebookF className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/sdcsaintjeanmarc/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-scout-navy/5 hover:bg-scout-navy text-scout-navy hover:text-white flex items-center justify-center transition"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/96179013907"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-scout-navy/5 hover:bg-scout-navy text-scout-navy hover:text-white flex items-center justify-center transition"
            >
              <FaWhatsapp className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Copyright footer */}
        <div className="text-center py-6 border-t border-scout-beige-dark mt-6">
          <span className="text-[10px] text-scout-charcoal/60 block">
            © {new Date().getFullYear()} Scouts des Cèdres Jbeil. All rights reserved.
          </span>
        </div>
      </main>
    </div>
  );
}

export default function PublicWinners() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-scout-beige">
          <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
        </div>
      }
    >
      <WinnersContent />
    </Suspense>
  );
}
