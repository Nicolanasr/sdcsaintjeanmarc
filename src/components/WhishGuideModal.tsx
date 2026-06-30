"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle, Smartphone, AlertTriangle } from "lucide-react";

interface WhishGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    locale?: string;
}

export default function WhishGuideModal({ isOpen, onClose, locale = "en" }: WhishGuideModalProps) {
    const isAr = locale === "ar";
    const [activeStep, setActiveStep] = useState(0);

    // Reset to first step when opened
    useEffect(() => {
        if (isOpen) setActiveStep(0);
    }, [isOpen]);

    if (!isOpen) return null;

    const steps = [
        {
            titleEn: "Open Whish & Copy Number",
            titleAr: "افتح Whish وانسخ الرقم",
            descEn: "On the payment page, tap \"Copy Number\" to copy our Whish phone number, then tap \"Open Whish App\".",
            descAr: "على صفحة الدفع، اضغط على \"نسخ الرقم\" لنسخ رقم هاتف Whish، ثم اضغط على \"افتح تطبيق Whish\".",
            image: "/images/WHISH-1.jpg",
        },
        {
            titleEn: "Tap \"Transfer\"",
            titleAr: "اضغط على \"Transfer\"",
            descEn: "Inside the Whish app home screen, tap the \"Transfer\" button.",
            descAr: "في الشاشة الرئيسية لتطبيق Whish، اضغط على زر \"Transfer\" (تحويل).",
            image: "/images/WHISH-2.jpg",
        },
        {
            titleEn: "Select \"Whish to Whish\"",
            titleAr: "اختر \"Whish to Whish\"",
            descEn: "From the transfer methods list, choose \"Whish to Whish\".",
            descAr: "من قائمة طرق التحويل، اختر \"Whish to Whish\".",
            image: "/images/WHISH-3.jpg",
        },
        {
            titleEn: "Enter number & exact amount, then Send",
            titleAr: "أدخل الرقم والمبلغ بالضبط ثم أرسل",
            descEn: "Paste the copied phone number, enter the exact amount shown on the website (no more, no less), then tap Send.",
            descAr: "الصق رقم الهاتف المنسوخ، أدخل المبلغ المحدد على الموقع بالضبط (لا أكثر ولا أقل)، ثم اضغط \"Send\".",
            image: "/images/WHISH-4.jpg",
            highlight: true,
        },
        {
            titleEn: "Go to Activity / Transactions",
            titleAr: "اذهب إلى \"Activity / Transactions\"",
            descEn: "Tap the Menu icon at the bottom right of the app, then select \"Activity / Transactions\".",
            descAr: "اضغط على أيقونة القائمة (Menu) في أسفل يمين التطبيق، ثم اختر \"Activity / Transactions\".",
            image: "/images/WHISH-5.jpg",
        },
        {
            titleEn: "Select your latest transaction",
            titleAr: "اختر أحدث معاملة",
            descEn: "Tap on the most recent transaction you just made to open its details.",
            descAr: "اضغط على أحدث معاملة أجريتها لفتح تفاصيلها.",
            image: "/images/WHISH-6.jpg",
        },
        {
            titleEn: "Copy the Transaction ID",
            titleAr: "انسخ رقم العملية",
            descEn: "On the transaction details screen, copy the Transaction ID (also called Reference Number).",
            descAr: "في شاشة تفاصيل المعاملة، انسخ رقم العملية (Transaction ID أو Reference Number).",
            image: "/images/WHISH-7.jpg",
        },
        {
            titleEn: "Paste it on the website & Submit",
            titleAr: "الصقه على الموقع واضغط تأكيد",
            descEn: "Go back to our website, paste the Transaction ID into the input field, then tap \"Confirm Payment\". Done! ✅",
            descAr: "ارجع إلى موقعنا، الصق رقم العملية في خانة الإدخال، ثم اضغط \"تأكيد الدفع\". انتهى! ✅",
            image: "/images/WHISH-8.jpg",
        },
    ];

    const handleNext = () => { if (activeStep < steps.length - 1) setActiveStep(activeStep + 1); };
    const handlePrev = () => { if (activeStep > 0) setActiveStep(activeStep - 1); };
    const currentStep = steps[activeStep];
    const isLast = activeStep === steps.length - 1;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" style={{ maxHeight: "95vh" }}>

                {/* ── Header ── */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    {/* Drag handle (mobile) */}
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-scout-navy rounded-xl flex items-center justify-center shrink-0">
                                <HelpCircle className="w-4 h-4 text-scout-gold" />
                            </div>
                            <div>
                                <h2 className="font-black text-scout-navy text-base leading-tight">
                                    {isAr ? "دليل الدفع عبر Whish" : "How to Pay via Whish"}
                                </h2>
                                <p className="text-[11px] text-gray-400">{isAr ? `الخطوة ${activeStep + 1} من ${steps.length}` : `Step ${activeStep + 1} of ${steps.length}`}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition cursor-pointer shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-scout-gold rounded-full transition-all duration-300"
                            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* ── Step pills (horizontal scroll) ── */}
                <div className="flex gap-1.5 px-5 py-3 overflow-x-auto shrink-0 scrollbar-hide border-b border-gray-50">
                    {steps.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStep(idx)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                idx === activeStep
                                    ? "bg-scout-navy text-white"
                                    : idx < activeStep
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-50 text-gray-400 border border-gray-100"
                            }`}
                        >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                                idx === activeStep ? "bg-scout-gold text-scout-navy" : idx < activeStep ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                            }`}>
                                {idx < activeStep ? "✓" : idx + 1}
                            </span>
                            <span className="whitespace-nowrap">{isAr ? `${idx + 1}` : `${idx + 1}`}</span>
                        </button>
                    ))}
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="flex flex-col lg:flex-row">

                        {/* Screenshot */}
                        <div className="lg:w-72 lg:shrink-0 flex justify-center items-center pt-5 pb-3 lg:py-6 lg:pl-5 lg:pr-0 bg-gray-50 lg:bg-transparent">
                            <div className="relative w-56 sm:w-64 bg-slate-950 rounded-[2.5rem] p-2.5 shadow-xl border-4 border-slate-800 aspect-[9/19] flex items-center justify-center overflow-hidden">
                                {/* Notch */}
                                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-800 rounded-full z-20" />
                                <div className="relative w-full h-full bg-slate-900 rounded-[2rem] overflow-hidden flex items-center justify-center">
                                    <img
                                        src={currentStep.image}
                                        alt={isAr ? currentStep.titleAr : currentStep.titleEn}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                    />
                                    <div className="absolute top-0 inset-x-0 h-5 bg-slate-950 z-10 rounded-b-lg flex justify-between items-center px-4 text-[7px] text-white/40 font-bold select-none">
                                        <span>9:41</span>
                                        <div className="flex gap-1 items-center">
                                            <span>LTE</span>
                                            <div className="w-3 h-1.5 border border-white/40 rounded-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="flex-1 p-5 space-y-4">
                            <div>
                                <h3 className="font-black text-scout-navy text-lg leading-snug">
                                    {isAr ? currentStep.titleAr : currentStep.titleEn}
                                </h3>
                                <p className={`mt-2 text-sm leading-relaxed rounded-xl p-3.5 ${
                                    currentStep.highlight
                                        ? "bg-amber-50 border border-amber-200 text-amber-900"
                                        : "bg-scout-navy/5 border-l-4 border-scout-navy text-scout-charcoal/90"
                                }`}>
                                    {currentStep.highlight && <span className="font-bold block text-amber-700 mb-1">⚠️ {isAr ? "مهم جداً!" : "Very Important!"}</span>}
                                    {isAr ? currentStep.descAr : currentStep.descEn}
                                </p>
                            </div>

                            {/* Tip */}
                            {activeStep === 0 && (
                                <div className="flex items-start gap-2.5 bg-scout-gold/5 border border-scout-gold/20 rounded-xl p-3 text-xs text-scout-charcoal/80">
                                    <Smartphone className="w-4 h-4 text-scout-gold shrink-0 mt-0.5" />
                                    <span>{isAr ? "إذا لم يفتح التطبيق تلقائياً، افتحه يدوياً من هاتفك." : "If the app doesn't open automatically, open it manually from your phone."}</span>
                                </div>
                            )}
                            {activeStep === 3 && (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span>{isAr ? "المبلغ الخاطئ يؤدي إلى تأخير أو رفض الطلب." : "Wrong amount will cause a delay or rejection of your ticket."}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer navigation ── */}
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-white">
                    <button
                        onClick={handlePrev}
                        disabled={activeStep === 0}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-scout-navy bg-scout-navy/5 hover:bg-scout-navy/10 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {isAr ? "السابق" : "Previous"}
                    </button>

                    {isLast ? (
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-scout-gold hover:bg-amber-400 text-scout-navy font-extrabold text-xs rounded-xl shadow cursor-pointer transition text-center"
                        >
                            {isAr ? "✅ فهمت! أعود للدفع" : "✅ Got it! Back to payment"}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex-1 justify-center"
                        >
                            {isAr ? "التالي" : "Next"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
