import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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
      where: { scoutId: userId },
    });

    // 2. Fetch total tickets sold
    const totalTicketsCount = await prisma.ticket.count();

    // 3. Fetch Leaderboard (aggregating tickets grouped by scout)
    const leaderboardData = await prisma.profile.findMany({
      select: {
        id: true,
        fullName: true,
        _count: {
          select: { tickets: true },
        },
      },
    });

    const leaderboard = leaderboardData
      .map((item:any) => ({
        id: item.id,
        full_name: item.fullName,
        tickets_count: item._count.tickets,
      }))
      .filter((item:any) => item.tickets_count > 0)
      .sort((a:any, b:any) => b.tickets_count - a.tickets_count);

    // 4. Fetch all detailed tickets if user is an admin
    let allTickets: any[] = [];
    if (userPayload.role === "admin") {
      allTickets = await prisma.ticket.findMany({
        include: {
          scout: { select: { fullName: true } },
          team: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      stats: {
        ticketsSold,
      },
      totalTicketsCount,
      leaderboard,
      allTickets,
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
    const { buyerName, buyerPhone, teamId } = await request.json();

    if (!buyerName || !buyerPhone || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      },
    });

    // Try sending automated WhatsApp if enabled
    try {
      const settings = getWhatsAppSettings();
      if (settings.sendOnPurchase) {
        const origin = request.headers.get("origin") || new URL(request.url).origin;
        const trackingLink = `${origin}/en/scout-world-cup/standings?phone=${encodeURIComponent(buyerPhone)}`;
        
        const msgAr = `شكرًا لشرائك تذكرة مسابقة سحب كأس الكشافة رقم #${ticket.id} لدعم فوج مار يوحنا مرقس - كشافة الأرز! فريقك المختار هو ${team.name}. كل فوز يحققه هذا الفريق يمنحك فرصة إضافية في السحب النهائي! ⚽️\n\nتابع تذكرتك ونقاط فريقك من هنا:\n${trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
        const msgEn = `Thank you for purchasing World Cup Scout Cup Draw ticket #${ticket.id} supporting Scouts des Cèdres Saint Jean Marc! Your selected team is ${team.name}. Every win they achieve grants you an extra entry in the final raffle! ⚽️\n\nTrack your ticket and team entries here:\n${trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
        
        const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;
        const sent = await sendWhatsAppMessage(buyerPhone, fullMsg);
        console.log(`Automated ticket purchase WhatsApp sent to ${buyerPhone}: ${sent}`);
      }
    } catch (wsErr) {
      console.error("Failed to send automatic WhatsApp for ticket purchase:", wsErr);
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
