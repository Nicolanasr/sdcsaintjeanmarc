"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Megaphone, Trophy, Phone, User, Globe, ChevronRight, ChevronDown, Plane } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import { TICKET_PRICE, TICKET_PRICE_DISPLAY, RAFFLE_PRIZE_EN, RAFFLE_PRIZE_AR, RAFFLE_DRAW_DATE_EN, RAFFLE_DRAW_DATE_AR } from "@/lib/constants";
import WhishGuideModal from "@/components/WhishGuideModal";

interface Team {
    id: string;
    name: string;
    flagUrl: string;
    totalWins: number;
    isEliminated: boolean;
}

const phoneValidationRules: Record<
    string,
    {
        name: string;
        validate: (local: string) => boolean;
        errorMsgEn: string;
        errorMsgAr: string;
    }
> = {
    "+961": {
        name: "Lebanon",
        validate: (local) => {
            const startsWithThree = local.startsWith("3");
            const expected = startsWithThree ? 7 : 8;
            return local.length === expected;
        },
        errorMsgEn: "Lebanese numbers starting with 3 must be exactly 7 digits, otherwise 8 digits.",
        errorMsgAr: "رقم الهاتف اللبناني الذي يبدأ بـ 3 يجب أن يكون 7 أرقام، وغير ذلك 8 أرقام."
    },
    "+971": {
        name: "UAE",
        validate: (local) => local.length === 9 && local.startsWith("5"),
        errorMsgEn: "UAE mobile numbers must start with 5 and be exactly 9 digits.",
        errorMsgAr: "أرقام هواتف الإمارات يجب أن تبدأ بـ 5 وتكون من 9 أرقام."
    },
    "+966": {
        name: "Saudi Arabia",
        validate: (local) => local.length === 9 && local.startsWith("5"),
        errorMsgEn: "Saudi mobile numbers must start with 5 and be exactly 9 digits.",
        errorMsgAr: "أرقام هواتف السعودية يجب أن تبدأ بـ 5 وتكون من 9 أرقام."
    },
    "+974": {
        name: "Qatar",
        validate: (local) => local.length === 8 && /^[3567]/.test(local),
        errorMsgEn: "Qatar mobile numbers must start with 3, 5, 6, or 7 and be exactly 8 digits.",
        errorMsgAr: "أرقام هواتف قطر يجب أن تبدأ بـ 3، 5، 6 أو 7 وتكون من 8 أرقام."
    },
    "+1": {
        name: "US/Canada",
        validate: (local) => local.length === 10,
        errorMsgEn: "US/Canada numbers must be exactly 10 digits.",
        errorMsgAr: "أرقام الولايات المتحدة/كندا يجب أن تكون من 10 أرقام."
    },
    "+44": {
        name: "UK",
        validate: (local) => local.length === 10 && local.startsWith("7"),
        errorMsgEn: "UK mobile numbers must start with 7 and be exactly 10 digits.",
        errorMsgAr: "أرقام هواتف المملكة المتحدة يجب أن تبدأ بـ 7 وتكون من 10 أرقام."
    },
    "+33": {
        name: "France",
        validate: (local) => local.length === 9 && /^[67]/.test(local),
        errorMsgEn: "France mobile numbers must start with 6 or 7 and be exactly 9 digits.",
        errorMsgAr: "أرقام هواتف فرنسا يجب أن تبدأ بـ 6 أو 7 وتكون من 9 أرقام."
    }
};

export default function BuyTicketPage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyerName, setBuyerName] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+961");
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [searchTeamQuery, setSearchTeamQuery] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Load teams
    useEffect(() => {
        async function loadTeams() {
            try {
                const res = await fetch("/api/teams");
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data.teams || []);
                }
            } catch (err) {
                console.error("Error loading teams:", err);
            } finally {
                setLoading(false);
            }
        }
        loadTeams();
    }, []);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!buyerName || !buyerPhone || !selectedTeamId) {
            setError(isAr ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
            return;
        }

        const rawDigits = buyerPhone.replace(/\D/g, "");
        let cleanedLocal = rawDigits;
        // Strip leading zero for local numbers
        if (cleanedLocal.startsWith("0")) {
            cleanedLocal = cleanedLocal.substring(1);
        }

        const rule = phoneValidationRules[countryCode];
        if (rule) {
            if (!rule.validate(cleanedLocal)) {
                setError(isAr ? rule.errorMsgAr : rule.errorMsgEn);
                return;
            }
        } else {
            // Fallback
            if (cleanedLocal.length < 7 || cleanedLocal.length > 15) {
                setError(
                    isAr
                        ? "يرجى إدخال رقم هاتف صالح (بين ٧ و ١٥ رقماً)."
                        : "Please enter a valid phone number (between 7 and 15 digits)."
                );
                return;
            }
        }

        const fullPhone = `${countryCode.replace("+", "")}${cleanedLocal}`;

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/public/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    buyerName,
                    buyerPhone: fullPhone,
                    teamId: selectedTeamId,
                    quantity,
                    locale,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Checkout failed");
            }

            if (data.redirectUrl) {
                router.push(data.redirectUrl);
            }
        } catch (err: any) {
            setError(err.message || (isAr ? "حدث خطأ أثناء الانتقال للدفع." : "An error occurred during checkout."));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTeams = teams.filter((t) =>
        t.name.toLowerCase().includes(searchTeamQuery.toLowerCase())
    );

    const sortedTeams = [...filteredTeams].sort((a, b) => b.totalWins - a.totalWins);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-scout-beige">
                <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-scout-beige text-scout-charcoal font-sans">
            {/* Header Banner */}
            <header className="bg-scout-navy text-white py-6 px-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-scout-green-light/10 blur-xl scale-150" />
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-2">
                    <img
                        src="/sdc-logo-removebg-preview.png"
                        alt="Scouts des Cèdres Logo"
                        className="w-28 h-28 object-contain drop-shadow-md filter invert-100 cursor-pointer"
                        onClick={() => router.push(`/${locale}/scout-world-cup/standings`)}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/sdc-logo.jpeg";
                        }}
                    />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-display text-scout-gold tracking-tight">
                            {isAr ? "شراء تذاكر سحب كأس الكشافة" : "Buy Scout Cup Draw Tickets"}
                        </h1>
                        <p className="text-xs text-white/70 mt-1 font-semibold tracking-wide">
                            {isAr ? "فوج سان جان مارك - جبيل" : "SDC Saint Jean Marc - Byblos"}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto pb-2 space-y-6">
                {/* Prize Hero Card */}
                <div className="overflow-hidden shadow-lg border border-scout-gold/30">
                    {/* Hero Banner — compact */}
                    <div className="relative bg-gradient-to-br from-scout-navy via-[#1a3a5c] to-[#0d2235] px-5 py-4 overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-scout-gold/5 rounded-full" />
                        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/3 rounded-full" />

                        <div className="relative flex items-center gap-4">
                            {/* Plane emoji */}
                            <div className="text-4xl shrink-0">✈️</div>

                            {/* Text */}
                            <div className="flex-1 text-left">
                                <div className="inline-flex items-center gap-1 bg-scout-gold/20 border border-scout-gold/40 rounded-full px-2 py-0.5 text-[10px] font-bold text-scout-gold uppercase tracking-wider mb-1">
                                    <Trophy className="w-2.5 h-2.5" />
                                    {isAr ? "الجائزة الكبرى" : "Grand Prize"}
                                </div>
                                <h2 className="text-xl font-black text-white leading-tight">
                                    {isAr ? (RAFFLE_PRIZE_AR || RAFFLE_PRIZE_EN) : RAFFLE_PRIZE_EN}
                                </h2>
                                <p className="text-scout-gold/80 text-xs font-semibold mt-0.5">
                                    {isAr ? "رحلة لشخص واحد!" : "A trip for 1 person!"}
                                </p>
                            </div>

                            {/* Price pill */}
                            <div className="shrink-0 flex flex-col items-center bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                                <span className="text-scout-gold font-black text-lg leading-none">{TICKET_PRICE_DISPLAY}</span>
                                <span className="text-white/50 text-[10px]">{isAr ? "فقط" : "only"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-white/40 mt-2 relative">
                            <span>📅</span>
                            <span>Draw date: {isAr ? (RAFFLE_DRAW_DATE_AR || RAFFLE_DRAW_DATE_EN) : RAFFLE_DRAW_DATE_EN}</span>
                        </div>
                    </div>

                    {/* Collapsible details */}
                    <div className="bg-white">
                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-scout-navy hover:bg-scout-navy/5 transition cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <span>{isAr ? "🤔 كيف تعمل المسابقة؟" : "How does it work?"}</span>
                            </span>
                            <ChevronDown className={`w-4 h-4 text-scout-navy/50 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
                        </button>

                        {showDetails && (
                            <div className="px-5 pb-5 border-t border-scout-navy/10 pt-4">
                                <h4 className="text-xs font-black text-scout-navy uppercase tracking-wider mb-3">
                                    📋 {isAr ? "قواعد السحب والمعادلة" : "Raffle Rules & Formula"}
                                </h4>
                                <ul className="space-y-2.5 text-xs text-scout-charcoal/80">
                                    {[
                                        {
                                            en: "Every ticket you purchase guarantees you at least one (1) entry in the final draw.",
                                            ar: "كل تذكرة تشتريها تضمن لك على الأقل فرصة واحدة (١) في السحب النهائي.",
                                        },
                                        {
                                            en: "Every time the team assigned to your ticket wins a match in the World Cup, you gain one (+1) bonus entry.",
                                            ar: "في كل مرة يفوز فيها المنتخب المخصص لتذكرتك بمباراة في كأس العالم، تحصل على فرصة إضافية (+١) في السحب.",
                                        },
                                        {
                                            en: "The Simple Formula: Total Raffle Entries = 1 (Guaranteed) + Team Wins.",
                                            ar: "المعادلة البسيطة: إجمالي الفرص = ١ (مضمونة) + عدد انتصارات المنتخب.",
                                        },
                                        {
                                            en: "Teams with zero wins still retain their guaranteed entry (1 ticket) in the draw.",
                                            ar: "المنتخبات التي لا تحقق أي فوز تحتفظ بفرصتها المضمونة (تذكرة واحدة) في السحب.",
                                        },
                                    ].map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-scout-gold font-black shrink-0">{idx + 1}.</span>
                                            <span>{isAr ? rule.ar : rule.en}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Purchase Form */}
                <form onSubmit={handleCheckout} className="glass-panel p-6 rounded-2xl shadow-md bg-white border border-scout-beige-dark space-y-6">
                    <h2 className="text-lg font-bold font-display text-scout-navy border-b pb-2">
                        📋 {isAr ? "معلومات بطاقة الدخول" : "Raffle Entry Details"}
                    </h2>

                    {error && (
                        <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                            {error}
                        </p>
                    )}

                    {/* Buyer Name */}
                    <div>
                        <label className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                            {isAr ? "اسم المشتري الثنائي / الثلاثي *" : "Full Name *"}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-scout-charcoal/40" />
                            <input
                                type="text"
                                required
                                value={buyerName}
                                onChange={(e) => setBuyerName(e.target.value)}
                                placeholder={isAr ? "مثال: ماريو خوري" : "e.g. Mario Khoury"}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Buyer Phone */}
                    <div>
                        <label className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                            {isAr ? "رقم الهاتف (واتساب) *" : "WhatsApp Number *"}
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm shadow-sm select-none"
                            >
                                <option value="+961">🇱🇧 +961</option>
                                <option value="+971">🇦🇪 +971</option>
                                <option value="+966">🇸🇦 +966</option>
                                <option value="+974">🇶🇦 +974</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+33">🇫🇷 +33</option>
                            </select>
                            <div className="relative flex-grow">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-scout-charcoal/40" />
                                <input
                                    type="tel"
                                    required
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                    placeholder={countryCode === "+961" ? (isAr ? "مثال: 70078138 أو 3123456" : "e.g. 70078138 or 3123456") : "e.g. 76543210"}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm shadow-sm"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-scout-charcoal/50 mt-1">
                            {isAr ? "سنقوم بإرسال تذكرتك ورابط المتابعة التلقائي إلى هذا الرقم." : "We will send your ticket and tracking dashboard link to this WhatsApp number."}
                        </p>
                    </div>

                    {/* Team Selector Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-scout-navy uppercase tracking-wider">
                                {isAr ? "اختر المنتخب  *" : "Select Your Team *"}
                            </label>
                            <input
                                type="text"
                                value={searchTeamQuery}
                                onChange={(e) => setSearchTeamQuery(e.target.value)}
                                placeholder={isAr ? "ابحث..." : "Search..."}
                                className="px-2.5 py-1 rounded-md border border-scout-beige-dark bg-white text-xs focus:outline-none focus:border-scout-navy w-32"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto border rounded-xl divide-y bg-scout-beige/20 shadow-inner">
                            {sortedTeams.map((t) => {
                                const entries = 1 + t.totalWins;
                                const isSelected = selectedTeamId === t.id;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => {
                                            if (!t.isEliminated) {
                                                setSelectedTeamId(t.id);
                                            }
                                        }}
                                        className={`flex items-center justify-between p-3 transition cursor-pointer select-none ${t.isEliminated
                                            ? "opacity-40 cursor-not-allowed bg-transparent"
                                            : isSelected
                                                ? "bg-scout-gold/20 border-l-4 border-scout-gold"
                                                : "hover:bg-white/60 bg-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={t.flagUrl}
                                                alt={t.name}
                                                className="w-8 h-5 object-cover rounded shadow-sm border border-black/10"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                }}
                                            />
                                            <div>
                                                <span className="font-semibold text-sm text-scout-navy">{t.name}</span>
                                                {t.isEliminated && (
                                                    <span className="text-[9px] font-bold text-red-600 block leading-none">
                                                        {isAr ? "مقصى" : "Eliminated"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs text-scout-green-light font-black block">
                                                {entries} {isAr ? "بطاقة سحب" : "Entries"}
                                            </span>
                                            <span className="text-[10px] text-scout-charcoal/50 block">
                                                {t.totalWins} {isAr ? "انتصارات" : "wins"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredTeams.length === 0 && (
                                <div className="text-center py-6 text-xs text-scout-charcoal/50">
                                    {isAr ? "لا توجد فرق مطابقة للبحث." : "No teams found."}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div>
                        <label className="block text-xs font-bold text-scout-navy uppercase tracking-wider mb-2">
                            {isAr ? "عدد التذاكر *" : "Number of Tickets *"}
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-10 rounded-lg bg-scout-beige-dark/40 hover:bg-scout-beige-dark text-scout-navy font-bold text-lg flex items-center justify-center transition select-none"
                            >
                                -
                            </button>
                            <span className="w-12 text-center text-lg font-bold text-scout-navy">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(q => Math.min(50, q + 1))}
                                className="w-10 h-10 rounded-lg bg-scout-beige-dark/40 hover:bg-scout-beige-dark text-scout-navy font-bold text-lg flex items-center justify-center transition select-none"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Payment Detail Display */}
                    <div className="bg-scout-gold/5 border border-scout-gold/30 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold text-scout-navy">
                            <span>{isAr ? "سعر التذاكر الإجمالي:" : "Total Tickets Price:"}</span>
                            <span className="text-scout-green-light text-base">${(TICKET_PRICE * quantity).toFixed(2)}</span>
                        </div>
                        {(() => {
                            const selectedTeam = teams.find(t => t.id === selectedTeamId);
                            const teamWins = selectedTeam ? selectedTeam.totalWins : 0;
                            const totalEntries = quantity * (1 + teamWins);
                            return (
                                <div className="flex justify-between items-center text-xs text-scout-navy/80 border-t border-scout-gold/20 pt-2">
                                    <span className="font-semibold">{isAr ? "إجمالي الفرص في السحب:" : "Total Raffle Entries:"}</span>
                                    <span className="font-black text-scout-gold text-sm">
                                        🎟️ {totalEntries} {isAr ? (totalEntries === 1 ? "فرصة" : "فرص") : (totalEntries === 1 ? "entry" : "entries")}
                                    </span>
                                </div>
                            );
                        })()}
                        <div className="text-[10px] text-scout-charcoal/70">
                            ⚡ {isAr
                                ? "سيتم إعادة توجيهك إلى بوابة Whish Pay للدفع بشكل آمن ومباشر."
                                : "You will be securely redirected to the Whish Pay portal to finalize your purchase."}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || !selectedTeamId}
                        className="w-full py-3 bg-scout-navy hover:bg-scout-navy-light text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                    >
                        <span>{submitting ? (isAr ? "جاري التوجيه..." : "Redirecting...") : (isAr ? "ادفع بواسطة Whish Pay" : "Pay with Whish Pay")}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsGuideOpen(true)}
                        className="w-full mt-3 text-center text-xs text-scout-navy hover:text-scout-gold font-bold transition flex items-center justify-center gap-1 cursor-pointer underline decoration-dotted"
                    >
                        {isAr ? "🤔 كيف أدفع عبر Whish؟ عرض الدليل المصوّر" : "🤔 How to pay via Whish? View Screenshot Guide"}
                    </button>
                </form>

                {/* Social Card Footer */}
                <div className="glass-panel p-4 rounded-2xl text-center space-y-3 bg-white/70">
                    <div className="text-xs font-semibold text-scout-navy">
                        {isAr ? "تابعنا للمزيد من التحديثات:" : "Follow our official channels:"}
                    </div>
                    <div className="flex justify-center gap-3">
                        <a href="https://www.facebook.com/SDCGroupeSJM/" target="_blank" rel="noopener" className="p-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-lg transition"><FaFacebookF className="w-4 h-4" /></a>
                        <a href="https://www.instagram.com/sdc_saintjeanmarc/" target="_blank" rel="noopener" className="p-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-lg transition"><FaInstagram className="w-4 h-4" /></a>
                        <a href="https://wa.me/96179013907" target="_blank" rel="noopener" className="p-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-lg transition"><FaWhatsapp className="w-4 h-4" /></a>
                        <a href="https://www.tiktok.com/@sdcsaintjeanmarc" target="_blank" rel="noopener" className="p-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-lg transition"><FaTiktok className="w-4 h-4" /></a>
                    </div>
                </div>
            </main>

            <WhishGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} locale={locale} />
        </div>
    );
}
