"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle, Smartphone, ExternalLink, Copy, Check } from "lucide-react";

interface WhishGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    locale?: string;
}

export default function WhishGuideModal({ isOpen, onClose, locale = "en" }: WhishGuideModalProps) {
    const isAr = locale === "ar";
    const [activeStep, setActiveStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            titleEn: "Step 1: Open Whish",
            titleAr: "الخطوة ١: فتح تطبيق Whish",
            descEn: "Click 'Pay with Whish Pay', copy the phone number shown on the screen, and open the Whish app.",
            descAr: "اضغط على 'ادفع بواسطة Whish'، ثم قم بنسخ رقم الهاتف المعروض على الشاشة، وافتح تطبيق Whish.",
            image: "/images/WHISH-1.jpg",
        },
        {
            titleEn: "Step 2: Transfer Section",
            titleAr: "الخطوة ٢: قسم التحويل",
            descEn: "On the home screen of the Whish app, click on the 'Transfer' button.",
            descAr: "في الشاشة الرئيسية لتطبيق Whish، اضغط على زر 'التحويل (Transfer)'.",
            image: "/images/WHISH-2.jpg",
        },
        {
            titleEn: "Step 3: Whish to Whish",
            titleAr: "الخطوة ٣: تحويل Whish إلى Whish",
            descEn: "Select the 'Whish to Whish' option from the list of transfer methods.",
            descAr: "اختر خيار 'من Whish إلى Whish (Whish to Whish)' من قائمة طرق التحويل.",
            image: "/images/WHISH-3.jpg",
        },
        {
            titleEn: "Step 4: Enter Details & Send",
            titleAr: "الخطوة ٤: إدخال البيانات والإرسال",
            descEn: "Enter the copied phone number and put the correct amount (this must be exactly the amount shown on the website), then click on 'Send'.",
            descAr: "أدخل رقم الهاتف المنسوخ واكتب المبلغ المطلوب بدقة (يجب أن يكون مطابقاً تماماً للمبلغ المعروض على الموقع)، ثم اضغط على 'إرسال (Send)'.",
            image: "/images/WHISH-4.jpg",
        },
        {
            titleEn: "Step 5: Go to Activity",
            titleAr: "الخطوة ٥: الذهاب للعمليات",
            descEn: "Click on the Menu on the bottom right, then select 'Activity / Transactions'.",
            descAr: "اضغط على تبويب القائمة (Menu) في أسفل يمين الشاشة، ثم اختر 'النشاط / العمليات (Activity / Transactions)'.",
            image: "/images/WHISH-5.jpg",
        },
        {
            titleEn: "Step 6: Select Transaction",
            titleAr: "الخطوة ٦: اختيار المعاملة",
            descEn: "Select the most recent transaction you just performed and click on it to view details.",
            descAr: "اختر أحدث معاملة قمت بها واضغط عليها لفتح التفاصيل.",
            image: "/images/WHISH-6.jpg",
        },
        {
            titleEn: "Step 7: Copy Transaction ID",
            titleAr: "الخطوة ٧: نسخ رقم العملية",
            descEn: "Copy the generated Transaction ID from the transaction details screen.",
            descAr: "قم بنسخ رقم العملية (Transaction ID) المعروض في شاشة تفاصيل المعاملة.",
            image: "/images/WHISH-7.jpg",
        },
        {
            titleEn: "Step 8: Submit ID on Website",
            titleAr: "الخطوة ٨: إدخال الرقم على الموقع",
            descEn: "Paste the copied Transaction ID into the transaction input field on our website, then click 'Submit'.",
            descAr: "ألصق رقم العملية المنسوخ في خانة التأكيد على الموقع، ثم اضغط على 'إرسال (Submit)'.",
            image: "/images/WHISH-8.jpg",
        },
    ];

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrev = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const currentStep = steps[activeStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scout-navy/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-scout-navy/10 animate-in zoom-in-95 duration-200"
                style={{ maxHeight: "90vh" }}
            >
                {/* Sidebar Index (Desktop Only) */}
                <div className="hidden md:flex flex-col w-72 bg-scout-navy/5 border-r border-scout-navy/10 p-5 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4 text-scout-navy">
                        <HelpCircle className="w-5 h-5 text-scout-gold" />
                        <h3 className="font-extrabold text-sm uppercase tracking-wider">
                            {isAr ? "دليل الدفع عبر Whish" : "Whish Payment Guide"}
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {steps.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveStep(idx)}
                                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${activeStep === idx
                                        ? "bg-scout-navy text-white shadow-md"
                                        : "text-scout-navy/70 hover:bg-scout-navy/10"
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === idx ? "bg-scout-gold text-scout-navy" : "bg-scout-navy/10 text-scout-navy"
                                    }`}>
                                    {idx + 1}
                                </span>
                                <span className="truncate">{isAr ? s.titleAr : s.titleEn}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Pane */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-scout-navy/10 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-scout-gold uppercase tracking-wider bg-scout-gold/10 px-2 py-0.5 rounded-full">
                                {isAr ? `الخطوة ${activeStep + 1} من ٨` : `Step ${activeStep + 1} of 8`}
                            </span>
                            <h2 className="font-black text-lg text-scout-navy mt-1">
                                {isAr ? currentStep.titleAr : currentStep.titleEn}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full bg-scout-navy/5 text-scout-navy hover:bg-scout-navy/10 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 min-h-0">
                        {/* Left/Top: Instructions Card */}
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-scout-charcoal/90 leading-relaxed bg-scout-navy/5 p-4 rounded-2xl border-l-4 border-scout-navy">
                                    {isAr ? currentStep.descAr : currentStep.descEn}
                                </p>
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <button
                                    onClick={handlePrev}
                                    disabled={activeStep === 0}
                                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-scout-navy bg-scout-navy/5 hover:bg-scout-navy/10 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {isAr ? "السابق" : "Previous"}
                                </button>
                                <div className="md:hidden flex gap-1">
                                    {steps.map((_, idx) => (
                                        <span
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${activeStep === idx ? "bg-scout-navy w-3" : "bg-scout-navy/20"
                                                }`}
                                        />
                                    ))}
                                </div>
                                {activeStep === steps.length - 1 ? (
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2.5 bg-scout-gold text-scout-navy hover:bg-scout-gold-light font-extrabold text-xs rounded-xl shadow cursor-pointer transition"
                                    >
                                        {isAr ? "فهمت الدليل" : "Got it, thanks!"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-1 px-4 py-2.5 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                                    >
                                        {isAr ? "التالي" : "Next"}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right/Bottom: Screenshot Preview */}
                        <div className="w-full lg:w-80 flex-shrink-0 flex justify-center items-center">
                            <div className="relative w-full max-w-[280px] bg-slate-950 rounded-[3rem] p-3 shadow-xl border-4 border-slate-800 aspect-[9/19] flex items-center justify-center overflow-hidden">
                                {/* Speaker */}
                                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                                    <div className="w-8 h-1 bg-slate-900 rounded-full" />
                                </div>

                                {/* Screen content */}
                                <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                                    <img
                                        src={currentStep.image}
                                        alt={isAr ? currentStep.titleAr : currentStep.titleEn}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    {/* Decorative phone notch */}
                                    <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 z-10 rounded-b-xl flex justify-between items-center px-6 text-[8px] text-white/50 font-bold font-sans select-none">
                                        <span>9:41</span>
                                        <div className="flex gap-1 items-center">
                                            <span>LTE</span>
                                            <div className="w-3 h-1.5 border border-white/50 rounded-sm" />
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                        <div className="bg-scout-gold/5 rounded-2xl p-4 border border-scout-gold/30 text-xs text-scout-navy space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <Smartphone className="w-4 h-4 text-scout-gold" />
                                <span>{isAr ? "نصيحة مفيدة:" : "Quick Tip:"}</span>
                            </div>
                            <p className="text-scout-charcoal/80 leading-relaxed">
                                {isAr
                                    ? "تأكيد: يجب أن يكون المبلغ المحوّل مطابقاً تماماً لقيمة الفاتورة المطلوبة لتفادي أي تأخير في تفعيل بطاقتك."
                                    : "Important: Ensure the transaction amount is exactly the total price requested to prevent verification delays."}
                            </p>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-800">
                                <span>⚠️ {isAr ? "ملاحظة هامة:" : "Important Note:"}</span>
                            </div>
                            <p className="leading-relaxed opacity-90">
                                {isAr
                                    ? "جميع عمليات تحويل Whish يتم مراجعتها والموافقة عليها يدوياً من قبل المسؤول لتأكيد التذاكر وتفعيلها."
                                    : "All Whish transfer transactions are manually reviewed and verified by an administrator to activate your tickets."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
