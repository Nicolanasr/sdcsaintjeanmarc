import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage, getTeamFlagEmoji } from "@/lib/whatsapp";

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

    // Group by teamId
    const teamGroups: Record<string, {
      teamName: string;
      flagUrl: string;
      ticketIds: number[];
    }> = {};

    tickets.forEach((t) => {
      const team = t.team;
      if (!teamGroups[t.teamId]) {
        teamGroups[t.teamId] = {
          teamName: team.name,
          flagUrl: team.flagUrl,
          ticketIds: [],
        };
      }
      teamGroups[t.teamId].ticketIds.push(t.id);
    });

    const teamListAr = Object.values(teamGroups).map((group) => {
      const flag = getTeamFlagEmoji(group.flagUrl, "");
      const ids = group.ticketIds.map((id) => `#${id}`).join("، ");
      return `${flag} ${group.teamName} (${group.ticketIds.length} بطاقة: ${ids})`;
    }).join("\n");

    const teamListEn = Object.values(teamGroups).map((group) => {
      const flag = getTeamFlagEmoji(group.flagUrl, "");
      const ids = group.ticketIds.map((id) => `#${id}`).join(", ");
      return `${flag} ${group.teamName} (${group.ticketIds.length} ticket(s): ${ids})`;
    }).join("\n");

    // Try sending automated WhatsApp if enabled
    try {
      const settings = await getWhatsAppSettings();
      if (settings.sendOnPurchase) {
        const origin = request.headers.get("origin") || new URL(request.url).origin;
        const trackingLink = `${origin}/en/scout-world-cup/standings?phone=${encodeURIComponent(firstTicket.buyerPhone)}`;
        
        const msgAr = `شكرًا لشرائك تذاكر مسابقة سحب كأس الكشافة لدعم فوج مار يوحنا مرقس - كشافة الأرز! ⚽️\n\nتذاكرك المشتراة:\n${teamListAr}\n\nكل فوز يحققه أي من هذه المنتخبات يمنحك فرصة إضافية في السحب النهائي!\n\nتابع تذاكرك ونقاط فريقك من هنا:\n${trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
        const msgEn = `Thank you for purchasing World Cup Scout Cup Draw ticket(s) supporting Scouts des Cèdres Saint Jean Marc! ⚽️\n\nYour purchased tickets:\n${teamListEn}\n\nEvery win they achieve grants you an extra entry in the final raffle!\n\nTrack your tickets and team entries here:\n${trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
        
        const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;
        const sent = await sendWhatsAppMessage(firstTicket.buyerPhone, fullMsg);
        console.log(`Automated public ticket purchase WhatsApp sent to ${firstTicket.buyerPhone}: ${sent}`);
      }
    } catch (wsErr) {
      console.error("Failed to send automatic WhatsApp for public ticket purchase:", wsErr);
    }

    return NextResponse.json({ success: true, ticketCount: tickets.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
