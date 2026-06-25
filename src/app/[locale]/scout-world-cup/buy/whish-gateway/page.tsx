"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft, Landmark, Copy, Check, ExternalLink } from "lucide-react";

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

    // Configuration for target Whish phone number
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
                if (!res.ok) {
                    throw new Error("Failed to load ticket");
                }
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
        navigator.clipboard.writeText((5 * ticketIds.length).toString());
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
            if (!res.ok) {
                throw new Error(data.error || "Failed to submit transaction ID");
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || (isAr ? "فشل تقديم رقم العملية." : "Failed to submit Transaction ID."));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <span className="animate-spin border-4 border-emerald-600 border-t-transparent rounded-full w-12 h-12" />
            </div>
        );
    }

    if (error && !submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-4">
                    <div className="text-red-500 font-extrabold text-2xl">⚠️ {isAr ? "خطأ" : "Error"}</div>
                    <p className="text-sm text-gray-600">{error || (isAr ? "معلومات غير صالحة" : "Invalid request")}</p>
                    <button
                        onClick={() => router.push(`/${locale}/scout-world-cup/buy`)}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition"
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
                <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-emerald-500/20 shadow-2xl text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-800/50 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                        <ShieldCheck className="w-12 h-12" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black font-display text-emerald-400">
                            {isAr ? "تم إرسال رقم المعاملة!" : "Transaction Submitted!"}
                        </h2>
                        <p className="text-sm text-gray-300">
                            {isAr
                                ? "شكرًا لك! رقم العملية الخاصة بك قيد المراجعة حاليًا."
                                : "Thank you! Your transaction reference is currently pending verification."}
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-left space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-gray-400">{isAr ? "رقم العملية:" : "Transaction ID:"}</span>
                            <span className="font-bold text-amber-400 font-mono">{transactionId}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {isAr
                                ? "سيقوم المسؤول بالتحقق من استلام المبلغ على تطبيق Whish والموافقة على تذاكرك قريبًا. بمجرد تأكيد الدفع، ستتلقى رسالة تأكيد رسمية مع تذاكرك ورابط التتبع عبر الواتساب."
                                : "The admin will check the transaction on Whish and approve your tickets shortly. Once verified, you will receive an official confirmation message with your tickets and standings link via WhatsApp."}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push(`/${locale}/scout-world-cup/standings?phone=${encodeURIComponent(ticketDetails.buyerPhone)}`)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl transition text-sm cursor-pointer shadow-lg"
                    >
                        {isAr ? "الذهاب إلى لوحة الترتيب والتذاكر" : "Go to Standings & Tickets"}
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = 5 * ticketIds.length;

    return (
        <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 relative flex flex-col">

                {/* Whish Header Bar */}
                <div className="bg-emerald-800 p-5 flex items-center justify-between border-b border-emerald-700">
                    <div className="flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-amber-400" />
                        <div>
                            <h2 className="text-sm font-black tracking-wider text-white">WHISH TRANSFER</h2>
                            <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">Manual Payment Instructions</span>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6 flex-grow">
                    {/* Invoice Summary */}
                    <div className="text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            {isAr ? "المبلغ المطلوب إرساله" : "Amount to Transfer"}
                        </span>
                        <div className="text-3xl font-black text-amber-400">${totalAmount.toFixed(2)}</div>
                        <span className="text-xs text-gray-300 block">
                            {isAr ? `تذاكر مسابقة كأس الكشافة (${ticketIds.length})` : `Scout Cup Draw Tickets (${ticketIds.length})`}
                        </span>
                    </div>

                    {/* Payment Steps */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            {isAr ? "خطوات الدفع عبر تطبيق Whish:" : "How to Pay via Whish App:"}
                        </h3>

                        {/* Step 1: Target Number Copy */}
                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">{isAr ? "1. أرسل الأموال إلى رقم الهاتف:" : "1. Send money to this Phone:"}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyPhone}
                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                                >
                                    {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedPhone ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ الرقم" : "Copy Number")}</span>
                                </button>
                            </div>
                            <div className="text-lg font-black text-white text-center tracking-wider py-1 select-all bg-slate-900/50 rounded-lg">
                                {whishPhoneNumber}
                            </div>
                        </div>

                        {/* Step 2: Open Whish App link */}
                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">{isAr ? "2. افتح تطبيق Whish للمتابعة:" : "2. Open Whish app to complete:"}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyAmount}
                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                                >
                                    {copiedAmount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedAmount ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ القيمة" : "Copy Amount")}</span>
                                </button>
                            </div>
                            <a
                                href={whishLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition font-display text-xs cursor-pointer shadow-md"
                            >
                                <span>{isAr ? "افتح تطبيق Whish Money" : "Open Whish Money"}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <p className="text-[10px] text-gray-400 text-center italic mt-1">
                                {isAr
                                    ? "ملاحظة: تأكد من إرسال القيمة المحددة أعلاه بالضبط."
                                    : "Note: Ensure you send the exact total amount listed above."}
                            </p>
                        </div>

                        {/* Step 3: Input Reference Form */}
                        <form onSubmit={handleSubmitTransaction} className="space-y-3 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">
                                    {isAr ? "3. أدخل رقم المعاملة لتأكيد الدفع (Transaction ID):" : "3. Enter Whish Transaction / Reference ID:"}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder={isAr ? "مثال: WSH123456789 أو الرقم المرجعي" : "e.g. WSH123456789 or Ref Number"}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-center text-base focus:border-emerald-500 focus:outline-none transition shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                            >
                                {processing ? (
                                    <span>{isAr ? "جاري الإرسال..." : "Submitting ID..."}</span>
                                ) : (
                                    <span>{isAr ? "إرسال رقم العملية للتأكيد" : "Submit Transaction Reference ID"}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
                    <button
                        onClick={() => router.push(`/${locale}/scout-world-cup/buy`)}
                        disabled={processing}
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{isAr ? "إلغاء والعودة" : "Cancel & Return"}</span>
                    </button>

                    <div className="flex gap-1.5 items-center text-[10px] text-gray-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600/70" />
                        <span>{isAr ? "معالجة يدوية آمنة" : "Secure Manual Verification"}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
