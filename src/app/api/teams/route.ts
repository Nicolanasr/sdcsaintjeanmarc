import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

// Helper to verify admin
async function isAdmin(request: Request) {
  const token = request.headers.get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ teams });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, name, flagUrl } = await request.json();
    if (!id || !name || !flagUrl) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        id: id.toUpperCase(),
        name,
        flagUrl,
      },
    });

    return NextResponse.json({ team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, totalWins, isEliminated } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing team id" }, { status: 400 });
    }

    const currentTeam = await prisma.team.findUnique({
      where: { id },
    });

    if (!currentTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        totalWins: totalWins !== undefined ? totalWins : undefined,
        isEliminated: isEliminated !== undefined ? isEliminated : undefined,
      },
    });

    if (totalWins !== undefined && totalWins > currentTeam.totalWins) {
      try {
        const settings = getWhatsAppSettings();
        if (settings.sendOnGoal) { // Keep using the sendOnGoal toggle setting for simplicity or general matches
          const tickets = await prisma.ticket.findMany({
            where: { teamId: id },
          });

          for (const ticket of tickets) {
            const msgAr = `المنتخب الذي اخترته (${team.name}) قد فاز في مباراته! ⚽️ إجمالي انتصاراتهم الآن هو ${totalWins}. لقد حصلت على بطاقة إضافية في السحب النهائي!\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
            const msgEn = `Your selected team (${team.name}) has won their match! ⚽️ Their total wins are now ${totalWins}. You have earned +1 bonus entry in the final raffle!\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
            const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;

            await sendWhatsAppMessage(ticket.buyerPhone, fullMsg);
          }
        }
      } catch (wsErr) {
        console.error("Failed to send manual win increase WhatsApp alert:", wsErr);
      }
    }

    return NextResponse.json({ team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
