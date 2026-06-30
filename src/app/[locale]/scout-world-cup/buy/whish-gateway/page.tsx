"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft, Copy, Check, ExternalLink, HelpCircle, ChevronRight, AlertCircle } from "lucide-react";
import { TICKET_PRICE } from "@/lib/constants";
import WhishGuideModal from "@/components/WhishGuideModal";

export default function WhishGatewayPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";

    const ticketIdsParam = searchParams.get("ticket_ids") || searchParams.get("ticket_id") || "";
    const ticketIds = ticketIdsParam.split(",").filter(Boolean);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [error, setError] = useState("");
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedAmount, setCopiedAmount] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const whishPhoneNumber = process.env.NEXT_PUBLIC_WHISH_PHONE || "+961 79 013 907";
    const [whishLink, setWhishLink] = useState("https://www.whish.money/");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
            if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
                setWhishLink("https://apps.apple.com/us/app/whish-money/id1284243483");
            } else if (/android/i.test(ua)) {
                setWhishLink("https://play.google.com/store/apps/details?id=com.wdf.whish");
            }
        }
    }, []);

    useEffect(() => {
        if (!ticketIdsParam || ticketIds.length === 0) {
            setError(isAr ? "معرّف التذكرة مفقود" : "Ticket ID is missing.");
            setLoading(false);
            return;
        }

        async function loadTicket() {
            try {
                const firstId = ticketIds[0];
                const res = await fetch(`/api/public/ticket?query=${firstId}`);
                if (!res.ok) throw new Error("Failed to load ticket");
                const data = await res.json();
                if (data.type === "single" && data.ticket) {
                    setTicketDetails(data.ticket);
                } else {
                    throw new Error("Invalid ticket details");
                }
            } catch (err: any) {
                setError(isAr ? "فشل تحميل تفاصيل الفاتورة" : "Failed to load invoice details.");
            } finally {
                setLoading(false);
            }
        }
        loadTicket();
    }, [ticketIdsParam, isAr]);

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(whishPhoneNumber.replace(/\s+/g, ""));
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const handleCopyAmount = () => {
        navigator.clipboard.writeText((TICKET_PRICE * ticketIds.length).toString());
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
    };

    const handleSubmitTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            alert(isAr ? "الرجاء إدخال رقم العملية" : "Please enter the Transaction ID");
            return;
        }

        setProcessing(true);
        setError("");

        try {
            const res = await fetch("/api/public/purchase/confirm-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketIds: ticketIds.map((id) => parseInt(id)),
                    whishTransactionId: transactionId.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit transaction ID");

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || (isAr ? "فشل تقديم رقم العملية." : "Failed to submit Transaction ID."));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-950">
                <div className="flex flex-col items-center gap-4 text-white">
                    <span className="animate-spin border-4 border-emerald-400 border-t-transparent rounded-full w-12 h-12" />
                    <span className="text-sm opacity-60">{isAr ? "جاري التحميل..." : "Loading..."}</span>
                </div>
            </div>
        );
    }

    if (error && !submitted) {
        return (
            <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
                <div className="max-w-sm w-full bg-slate-900 rounded-2xl shadow-2xl p-6 text-center space-y-5 border border-red-500/20">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">{isAr ? "حدث خطأ" : "Something went wrong"}</h2>
                        <p className="text-sm text-gray-400 mt-1">{error || (isAr ? "معلومات غير صالحة" : "Invalid request")}</p>
                    </div>
                    <button
                        onClick={() => router.push(`/${locale}/scout-world-cup/buy`)}
                        className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition"
                    >
                        {isAr ? "العودة" : "Go Back"}
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-8 border border-emerald-500/20 shadow-2xl text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-lg shadow-emerald-900">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-emerald-400">
                            {isAr ? "تم الإرسال!" : "Submitted!"}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {isAr
                                ? "رقم العملية قيد المراجعة من قبل الإدارة."
                                : "Your transaction is pending admin review."}
                        </p>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-4 text-left space-y-3 text-sm border border-slate-700">
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-400 shrink-0">{isAr ? "رقم العملية:" : "Transaction ID:"}</span>
                            <span className="font-bold text-amber-400 font-mono text-right break-all">{transactionId}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {isAr
                                    ? "سيتحقق المسؤول من الدفع ويفعّل تذاكرك قريباً. ستصلك رسالة واتساب بعد التأكيد."
                                    : "The admin will verify the payment and activate your tickets shortly. You'll receive a WhatsApp confirmation once verified."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`/${locale}/scout-world-cup/standings?phone=${encodeURIComponent(ticketDetails?.buyerPhone || "")}`)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl transition text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2"
                    >
                        <span>{isAr ? "تابع ترتيب الفرق وتذاكرك" : "View Standings & My Tickets"}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = TICKET_PRICE * ticketIds.length;

    const steps = [
        {
            num: "1",
            icon: "📋",
            titleEn: "Copy the phone number",
            titleAr: "انسخ رقم الهاتف",
            action: (
                <div className="space-y-2">
                    <div className="bg-slate-950 rounded-xl px-4 py-3 text-center select-all">
                        <span className="text-xl font-black text-white tracking-widest">{whishPhoneNumber}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCopyPhone}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                            copiedPhone
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                    >
                        {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedPhone ? (isAr ? "✓ تم النسخ!" : "✓ Copied!") : (isAr ? "نسخ الرقم" : "Copy Number")}</span>
                    </button>
                </div>
            ),
        },
        {
            num: "2",
            icon: "📱",
            titleEn: "Open Whish & Send",
            titleAr: "افتح Whish وأرسل المبلغ",
            action: (
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3">
                        <span className="text-gray-400 text-xs">{isAr ? "المبلغ المطلوب:" : "Amount to send:"}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-amber-400">${totalAmount.toFixed(2)}</span>
                            <button
                                type="button"
                                onClick={handleCopyAmount}
                                className={`p-1.5 rounded-lg transition text-xs ${copiedAmount ? "bg-emerald-600 text-white" : "bg-slate-800 text-emerald-400 hover:bg-slate-700"}`}
                            >
                                {copiedAmount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                    <a
                        href={whishLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm cursor-pointer shadow-md"
                    >
                        <span>{isAr ? "افتح تطبيق Whish" : "Open Whish App"}</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-[11px] text-amber-400/80 text-center">
                        ⚠️ {isAr ? "أرسل المبلغ المحدد أعلاه بالضبط" : "Send the exact amount shown above"}
                    </p>
                </div>
            ),
        },
        {
            num: "3",
            icon: "🔑",
            titleEn: "Paste your Transaction ID",
            titleAr: "الصق رقم العملية",
            action: (
                <form onSubmit={handleSubmitTransaction} className="space-y-2">
                    <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder={isAr ? "مثال: WSH123456789" : "e.g. WSH123456789"}
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm text-center focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition placeholder:text-gray-600"
                    />
                    {error && (
                        <p className="text-xs text-red-400 text-center bg-red-500/10 rounded-lg p-2">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={processing || !transactionId.trim()}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {processing ? (
                            <><span className="animate-spin border-2 border-slate-900 border-t-transparent rounded-full w-4 h-4" />{isAr ? "جاري الإرسال..." : "Submitting..."}</>
                        ) : (
                            <><ShieldCheck className="w-4 h-4" />{isAr ? "تأكيد الدفع" : "Confirm Payment"}</>
                        )}
                    </button>
                </form>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-sm flex flex-col gap-4">

                {/* Header */}
                <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-600/30 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> {isAr ? "دفع آمن عبر Whish" : "Secure Whish Payment"}
                    </div>
                    <h1 className="text-2xl font-black text-white">{isAr ? "ادفع عبر Whish" : "Pay with Whish"}</h1>
                    <p className="text-xs text-gray-400">{isAr ? "اتبع الخطوات الثلاث أدناه" : "Follow the 3 steps below to complete your payment"}</p>
                </div>

                {/* Total amount summary */}
                <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-5 text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{isAr ? "إجمالي المبلغ" : "Total Amount"}</p>
                    <div className="text-5xl font-black text-amber-400 leading-none">${totalAmount.toFixed(2)}</div>
                    <p className="text-xs text-gray-400 mt-2">
                        {ticketIds.length} {isAr ? "تذكرة" : `ticket${ticketIds.length > 1 ? "s" : ""}`} × ${TICKET_PRICE}.00
                    </p>
                </div>

                {/* Guide CTA */}
                <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="w-full flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm font-bold text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        {isAr ? "لا تعرف كيف؟ شاهد الدليل المصوّر" : "Don't know how? View Screenshot Guide"}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {/* Steps */}
                <div className="flex flex-col gap-3">
                    {steps.map((step, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                                    {step.num}
                                </div>
                                <div>
                                    <span className="text-base mr-1">{step.icon}</span>
                                    <span className="font-bold text-sm text-white">{isAr ? step.titleAr : step.titleEn}</span>
                                </div>
                            </div>
                            <div>{step.action}</div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                    <button
                        onClick={() => router.push(`/${locale}/scout-world-cup/buy`)}
                        disabled={processing}
                        className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{isAr ? "إلغاء والعودة" : "Cancel & Return"}</span>
                    </button>
                    <div className="flex items-center gap-1 text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isAr ? "معالجة آمنة" : "Secure & Verified"}</span>
                    </div>
                </div>
            </div>

            <WhishGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} locale={locale} />
        </div>
    );
}
