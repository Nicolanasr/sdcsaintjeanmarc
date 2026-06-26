import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
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

    // 4. Fetch all detailed tickets if user is an admin
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

    return NextResponse.json({
      stats: {
        ticketsSold,
        pendingCashCount,
        pendingCashAmount: pendingCashCount * TICKET_PRICE,
      },
      totalTicketsCount,
      leaderboard,
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
    const { buyerName, buyerPhone, teamId, paymentMethod = "CASH", whishTransactionId } = await request.json();

    if (!buyerName || !buyerPhone || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Create ticket
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

    if (!isWhish) {
      // Try sending automated WhatsApp if enabled
      try {
        const settings = await getWhatsAppSettings();
        if (settings.sendOnPurchase) {
          const origin = request.headers.get("origin") || new URL(request.url).origin;
          const trackingLink = `${origin}/en/scout-world-cup/standings?phone=${encodeURIComponent(buyerPhone)}`;
          
          const templateAr = settings.templatePurchaseAr || "شكرًا لشرائك تذكرة مسابقة سحب كأس الكشافة رقم #{ticketId} لدعم فوج مار يوحنا مرقس - كشافة الأرز! فريقك المختار هو {teamName}. كل فوز يحققه هذا الفريق يمنحك فرصة إضافية في السحب النهائي! ⚽️\n\nتابع تذكرتك ونقاط فريقك من هنا:\n{trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/";
          const templateEn = settings.templatePurchaseEn || "Thank you for purchasing World Cup Scout Cup Draw ticket #{ticketId} supporting Scouts des Cèdres Saint Jean Marc! Your selected team is {teamName}. Every win they achieve grants you an extra entry in the final raffle! ⚽️\n\nTrack your ticket and team entries here:\n{trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/";

          const interpolate = (tmpl: string) => {
            return tmpl
              .replace(/{ticketId}/g, String(ticket.id))
              .replace(/{buyerName}/g, buyerName)
              .replace(/{teamName}/g, team.name)
              .replace(/{trackingLink}/g, trackingLink);
          };

          const msgAr = interpolate(templateAr);
          const msgEn = interpolate(templateEn);
          
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
        
        const alertMsg = `📢 New Scout Whish payment verification pending! ⏳\n\nScout: ${userPayload.fullName || "Scout"}\nBuyer: ${buyerName}\nTxID: ${whishTransactionId.trim()}\n\nApprove here:\n${approvalLink}`;
        await sendWhatsAppMessage("+96170078138", alertMsg);
      } catch (err) {
        console.error("Failed to send WhatsApp alert to admin for scout Whish payment:", err);
      }
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
