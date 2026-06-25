"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, ArrowLeft, Landmark } from "lucide-react";

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

  // Fetch ticket details to render on screen
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

  const handlePay = async () => {
    if (ticketIds.length === 0 || !ticketDetails) return;
    
    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/public/purchase/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketIds: ticketIds.map((id) => parseInt(id)),
          whishTransactionId: `MOCK_WSH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // Redirect back to standings with the phone number
      const phoneParam = encodeURIComponent(ticketDetails.buyerPhone);
      router.push(`/${locale}/scout-world-cup/standings?phone=${phoneParam}`);
    } catch (err: any) {
      setError(err.message || (isAr ? "فشل إتمام العملية." : "Payment processing failed."));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="animate-spin border-4 border-green-600 border-t-transparent rounded-full w-12 h-12" />
      </div>
    );
  }

  if (error || !ticketDetails) {
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

  return (
    <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 relative flex flex-col">
        {/* Whish Top Branding Bar */}
        <div className="bg-emerald-800 p-5 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-sm font-black tracking-wider text-white">WHISH PAY</h2>
              <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">Simulator Merchant checkout</span>
            </div>
          </div>
          <span className="bg-emerald-900 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {isAr ? "تجريبي" : "SANDBOX"}
          </span>
        </div>

        {/* Invoice Detail Section */}
        <div className="p-6 space-y-6 flex-grow">
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {isAr ? "قيمة الفاتورة" : "Amount to Pay"}
            </span>
            <div className="text-3xl font-black text-amber-400">${(5 * ticketIds.length).toFixed(2)}</div>
            <span className="text-[10px] text-gray-400 block">
              {isAr ? "فوج مار يوحنا مرقس - كشافة الأرز" : "Scouts des Cèdres SJM"}
            </span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-xs font-bold text-gray-300 border-b border-slate-700 pb-2 flex justify-between">
              <span>{isAr ? "تفاصيل التذكرة" : "Ticket Details"}</span>
              <span className="text-amber-400 font-black">
                {ticketIds.length > 1 ? (isAr ? `${ticketIds.length} تذاكر` : `${ticketIds.length} Tickets`) : `#${ticketDetails.id}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2.5 text-xs">
              <div className="text-gray-400">{isAr ? "الاسم:" : "Name:"}</div>
              <div className="text-right font-semibold">{ticketDetails.buyerName}</div>

              <div className="text-gray-400">{isAr ? "الهاتف:" : "Phone:"}</div>
              <div className="text-right font-semibold">{ticketDetails.buyerPhone}</div>

              <div className="text-gray-400">{isAr ? "المنتخب المختار:" : "Selected Team:"}</div>
              <div className="text-right font-bold text-emerald-400">
                {ticketDetails.team?.name || ticketDetails.teamId}
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-center text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "عملية دفع مشفرة وآمنة بنسبة 100%" : "100% Secure Encrypted Sandbox Checkout"}</span>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {processing ? (
              <span>{isAr ? "جاري المعالجة..." : "Processing Payment..."}</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isAr ? "تأكيد الدفع والسداد" : `Authorize & Pay $${(5 * ticketIds.length).toFixed(2)}`}</span>
              </>
            )}
          </button>

          <button
            onClick={() => router.push(`/${locale}/scout-world-cup/buy`)}
            disabled={processing}
            className="w-full py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>{isAr ? "إلغاء عملية الدفع" : "Cancel & Return"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
