import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage, getTeamFlagEmoji } from "@/lib/whatsapp";
import { TICKET_PRICE } from "@/lib/constants";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

// Helper to verify user
async function getUserPayload(request: Request) {
  const token = request.headers.get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userPayload = await getUserPayload(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userPayload.userId as string;

    // 1. Fetch tickets sold by this scout
    const ticketsSold = await prisma.ticket.count({
      where: { scoutId: userId, paymentStatus: "PAID" },
    });

    const pendingCashCount = await prisma.ticket.count({
      where: {
        scoutId: userId,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
        cashSettled: false,
      },
    });

    // 2. Fetch total tickets sold (only PAID)
    const totalTicketsCount = await prisma.ticket.count({
      where: { paymentStatus: "PAID" },
    });

    // 3. Fetch Leaderboard (aggregating PAID tickets grouped by scout)
    const leaderboardData = await prisma.profile.findMany({
      select: {
        id: true,
        fullName: true,
        unit: true,
        tickets: {
          where: { paymentStatus: "PAID" },
          select: { id: true },
        },
      },
    });

    const leaderboard = leaderboardData
      .map((item: any) => ({
        id: item.id,
        full_name: item.fullName,
        unit: item.unit,
        tickets_count: item.tickets.length,
      }))
      .filter((item: any) => item.tickets_count > 0)
      .sort((a: any, b: any) => b.tickets_count - a.tickets_count);

    // 4. Fetch all detailed tickets if user is an admin or scout's own tickets
    const myTickets = await prisma.ticket.findMany({
      where: { scoutId: userId },
      include: { team: true },
      orderBy: { createdAt: "desc" },
    });

    let allTickets: any[] = [];
    let whatsAppLogs: any[] = [];
    if (userPayload.role === "admin") {
      allTickets = await prisma.ticket.findMany({
        include: {
          scout: { select: { fullName: true } },
          team: true,
        },
        orderBy: { createdAt: "desc" },
      });
      whatsAppLogs = await prisma.whatsAppLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }

    // Sum ticket counts per unit
    const unitStats: Record<string, number> = {
      jouwele: 0,
      mounjidet: 0,
      kechefe: 0,
      mourchidet: 0,
      jaramiz: 0,
      zaharat: 0,
      iyede: 0,
    };

    leaderboardData.forEach((p: any) => {
      const u = p.unit?.toLowerCase().trim();
      if (u && Object.prototype.hasOwnProperty.call(unitStats, u)) {
        unitStats[u] += p.tickets.length;
      }
    });

    const unitLeaderboard = Object.entries(unitStats)
      .map(([unit, tickets_count]) => ({
        unit,
        tickets_count,
      }))
      .sort((a, b) => b.tickets_count - a.tickets_count);

    return NextResponse.json({
      stats: {
        ticketsSold,
        pendingCashCount,
        pendingCashAmount: pendingCashCount * TICKET_PRICE,
      },
      totalTicketsCount,
      leaderboard,
      unitLeaderboard,
      myTickets,
      allTickets,
      whatsAppLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userPayload = await getUserPayload(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userPayload.userId as string;
    const { buyerName, buyerPhone, teamId, paymentMethod = "CASH", whishTransactionId, quantity = 1 } = await request.json();

    if (!buyerName || !buyerPhone || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 50) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const isWhish = paymentMethod === "WHISH";
    if (isWhish && !whishTransactionId) {
      return NextResponse.json({ error: "Whish Transaction ID is required" }, { status: 400 });
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create tickets in a loop
    const createdTickets = [];
    for (let i = 0; i < qty; i++) {
      const ticket = await prisma.ticket.create({
        data: {
          scoutId: userId,
          buyerName,
          buyerPhone,
          teamId,
          paymentMethod: isWhish ? "WHISH" : "CASH",
          paymentStatus: isWhish ? "PENDING" : "PAID",
          whishTransactionId: isWhish ? whishTransactionId.trim() : null,
        },
      });
      createdTickets.push(ticket);
    }

    if (!isWhish) {
      // Try sending automated WhatsApp if enabled
      try {
        const settings = await getWhatsAppSettings();
        if (settings.sendOnPurchase) {
          const origin = request.headers.get("origin") || new URL(request.url).origin;
          const trackingLink = `${origin}/en/scout-world-cup/standings?phone=${encodeURIComponent(buyerPhone)}`;
          
          const flagEmoji = getTeamFlagEmoji(team.flagUrl, team.id);
          const ticketIdsStr = createdTickets.map((t) => `#${t.id}`).join(", ");
          const ticketIdsStrAr = createdTickets.map((t) => `#${t.id}`).join("، ");

          const msgAr = `شكرًا لشرائك تذاكر مسابقة سحب كأس الكشافة (${createdTickets.length} بطاقة: ${ticketIdsStrAr}) لدعم فوج مار يوحنا مرقس - كشافة الأرز! منتخبك المختار هو ${team.name} ${flagEmoji}. كل فوز يحققه هذا المنتخب يمنحك فرصة إضافية في السحب النهائي! ⚽️\n\nتابع تذاكرك ونقاط فريقك من هنا:\n${trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
          const msgEn = `Thank you for purchasing World Cup Scout Cup Draw ticket(s) (${createdTickets.length} ticket(s): ${ticketIdsStr}) supporting Scouts des Cèdres Saint Jean Marc! Your selected team is ${team.name} ${flagEmoji}. Every win they achieve grants you an extra entry in the final raffle! ⚽️\n\nTrack your tickets and team entries here:\n${trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
          
          const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;
          const sent = await sendWhatsAppMessage(buyerPhone, fullMsg);
          console.log(`Automated ticket purchase WhatsApp sent to ${buyerPhone}: ${sent}`);
        }
      } catch (wsErr) {
        console.error("Failed to send automatic WhatsApp for ticket purchase:", wsErr);
      }
    } else {
      // Send WhatsApp notification to admin (+96170078138) for pending Whish ticket
      try {
        const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
        const approvalLink = `${origin}/en/scout-world-cup/dashboard/admin`;
        
        const alertMsg = `📢 New Scout Whish payment verification pending! ⏳\n\nScout: ${userPayload.fullName || "Scout"}\nBuyer: ${buyerName}\nQty: ${createdTickets.length} tickets\nTxID: ${whishTransactionId.trim()}\n\nApprove here:\n${approvalLink}`;
        await sendWhatsAppMessage("+96170078138", alertMsg);
      } catch (err) {
        console.error("Failed to send WhatsApp alert to admin for scout Whish payment:", err);
      }
    }

    return NextResponse.json({ success: true, count: createdTickets.length, tickets: createdTickets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
