import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage, getTeamFlagEmoji } from "@/lib/whatsapp";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

// Helper to verify user is admin
async function checkAdmin(request: Request) {
  const token = request.headers.get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketIds, status = "PAID" } = await request.json();
    if (!ticketIds || !Array.isArray(ticketIds)) {
      return NextResponse.json({ error: "Missing or invalid ticketIds array" }, { status: 400 });
    }

    if (status !== "PAID" && status !== "REJECTED") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const numericIds = ticketIds.map((id: any) => parseInt(id)).filter((id) => !isNaN(id));
    if (numericIds.length === 0) {
      return NextResponse.json({ error: "No valid ticket IDs provided" }, { status: 400 });
    }

    // Load the tickets first
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: numericIds } },
      include: { team: true },
    });

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: "No matching tickets found" }, { status: 404 });
    }

    // Update tickets status to status
    await prisma.ticket.updateMany({
      where: { id: { in: numericIds } },
      data: {
        paymentStatus: status,
      },
    });

    if (status === "PAID") {
      // Send WhatsApp confirmation
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

      try {
        const settings = await getWhatsAppSettings();
        if (settings.sendOnPurchase) {
          const origin = request.headers.get("origin") || new URL(request.url).origin;
          const trackingLink = `${origin}/en/scout-world-cup/standings?phone=${encodeURIComponent(firstTicket.buyerPhone)}`;
          
          const msgAr = `شكرًا لشرائك تذاكر مسابقة سحب كأس الكشافة لدعم فوج مار يوحنا مرقس - كشافة الأرز! ⚽️\n\nتذاكرك المشتراة:\n${teamListAr}\n\nكل فوز يحققه أي من هذه المنتخبات يمنحك فرصة إضافية في السحب النهائي!\n\nتابع تذاكرك ونقاط فريقك من هنا:\n${trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
          const msgEn = `Thank you for purchasing World Cup Scout Cup Draw ticket(s) supporting Scouts des Cèdres Saint Jean Marc! ⚽️\n\nYour purchased tickets:\n${teamListEn}\n\nEvery win they achieve grants you an extra entry in the final raffle!\n\nTrack your tickets and team entries here:\n${trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
          
          const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;
          const sent = await sendWhatsAppMessage(firstTicket.buyerPhone, fullMsg);
          console.log(`Manual verification WhatsApp confirmation sent to ${firstTicket.buyerPhone}: ${sent}`);
        }
      } catch (wsErr) {
        console.error("Failed to send WhatsApp confirmation after verification:", wsErr);
      }
    }

    return NextResponse.json({ success: true, count: numericIds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
