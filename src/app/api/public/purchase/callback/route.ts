import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const { ticketId, ticketIds, whishTransactionId } = await request.json();

    if (!ticketId && !ticketIds) {
      return NextResponse.json({ error: "Missing ticket identifiers" }, { status: 400 });
    }

    const ids: number[] = [];
    if (ticketIds) {
      if (Array.isArray(ticketIds)) {
        ids.push(...ticketIds.map((id: any) => parseInt(id)));
      } else {
        ids.push(...String(ticketIds).split(",").map((id: any) => parseInt(id)));
      }
    } else if (ticketId) {
      ids.push(parseInt(ticketId));
    }

    const tickets = await prisma.ticket.findMany({
      where: { id: { in: ids } },
      include: { team: true },
    });

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: "Tickets not found" }, { status: 404 });
    }

    const txId = whishTransactionId || `MOCK_WSH_${Date.now()}`;

    // Update tickets to PAID
    await prisma.ticket.updateMany({
      where: { id: { in: ids } },
      data: {
        paymentStatus: "PAID",
        whishTransactionId: txId,
      },
    });

    const firstTicket = tickets[0];
    const ticketCount = tickets.length;
    const ticketIdsStr = tickets.map((t) => `#${t.id}`).join(", ");
    const teamName = firstTicket.team?.name || "";

    // Try sending automated WhatsApp if enabled
    try {
      const settings = await getWhatsAppSettings();
      if (settings.sendOnPurchase) {
        const origin = request.headers.get("origin") || new URL(request.url).origin;
        const trackingLink = `${origin}/en/scout-world-cup/standings?phone=${encodeURIComponent(firstTicket.buyerPhone)}`;
        
        const msgAr = `شكرًا لشرائك تذكرة مسابقة سحب كأس الكشافة (${ticketCount} تذاكر: ${ticketIdsStr}) لدعم فوج مار يوحنا مرقس - كشافة الأرز! فريقك المختار هو ${teamName}. كل فوز يحققه هذا الفريق يمنحك فرصة إضافية في السحب النهائي! ⚽️\n\nتابع تذاكرك ونقاط فريقك من هنا:\n${trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
        const msgEn = `Thank you for purchasing World Cup Scout Cup Draw ticket(s) (${ticketCount} ticket(s): ${ticketIdsStr}) supporting Scouts des Cèdres Saint Jean Marc! Your selected team is ${teamName}. Every win they achieve grants you an extra entry in the final raffle! ⚽️\n\nTrack your tickets and team entries here:\n${trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
        
        const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;
        const sent = await sendWhatsAppMessage(firstTicket.buyerPhone, fullMsg);
        console.log(`Automated public ticket purchase WhatsApp sent to ${firstTicket.buyerPhone}: ${sent}`);
      }
    } catch (wsErr) {
      console.error("Failed to send automatic WhatsApp for public ticket purchase:", wsErr);
    }

    return NextResponse.json({ success: true, ticketCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
