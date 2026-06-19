import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

export async function GET(request: Request) {
  // 1. Secure check: Allow Cron Secret authorization header
  const authHeader = request.headers.get("authorization");
  const isCronAuthorized =
    process.env.CRON_SECRET &&
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  // 2. Secure check: Allow logged-in Admin session cookie
  let isAdminAuthorized = false;
  const token = request.headers.get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role === "admin") {
        isAdminAuthorized = true;
      }
    } catch {
      // Invalid token
    }
  }

  if (!isCronAuthorized && !isAdminAuthorized) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey || apiKey === "your-football-api-key") {
    return NextResponse.json(
      { message: "Football API Key not configured. Skipping automated sync." },
      { status: 200 }
    );
  }

  try {
    // Fetch World Cup matches from Football-Data.org (Competition: WC)
    const res = await fetch("http://api.football-data.org/v4/competitions/WC/matches", {
      headers: {
        "X-Auth-Token": apiKey,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Football API returned status ${res.status}`);
    }

    const data = await res.json();
    const matches = data.matches || [];

    const goalsMap: Record<string, number> = {};

    matches.forEach((match: any) => {
      if (match.status === "FINISHED" || match.status === "IN_PLAY") {
        const homeCode = match.homeTeam.tla || match.homeTeam.id?.toString();
        const awayCode = match.awayTeam.tla || match.awayTeam.id?.toString();
        if(awayCode == "CAN" || homeCode =="CAN"){
            console.log(match)
        }

        const homeGoals = match.score.fullTime.home ?? 0;
        const awayGoals = match.score.fullTime.away ?? 0;

        if (homeCode) {
          goalsMap[homeCode] = (goalsMap[homeCode] || 0) + homeGoals;
        }
        if (awayCode) {
          goalsMap[awayCode] = (goalsMap[awayCode] || 0) + awayGoals;
        }
      }
    });

    // Update teams in Prisma database
    const updates = Object.entries(goalsMap).map(async ([teamId, goals]) => {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, name: true, totalGoals: true },
      });

      if (team) {
        const goalsDiff = goals - team.totalGoals;

        const updatedTeam = await prisma.team.update({
          where: { id: teamId },
          data: { totalGoals: goals },
        });

        if (goalsDiff > 0) {
          try {
            const settings = getWhatsAppSettings();
            if (settings.sendOnGoal) {
              const tickets = await prisma.ticket.findMany({
                where: { teamId },
              });

              for (const ticket of tickets) {
                const msgAr = `المنتخب الذي اخترته (${team.name}) قد سجل هدفًا جديدًا! ⚽️ إجمالي أهدافهم الآن هو ${goals}. حظًا موفقًا في السحب النهائي!\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
                const msgEn = `Your selected team (${team.name}) has scored a new goal! ⚽️ Their total goals are now ${goals}. Good luck in the final raffle!\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/`;
                const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;

                await sendWhatsAppMessage(ticket.buyerPhone, fullMsg);
              }
            }
          } catch (wsErr) {
            console.error("Failed to send automatic WhatsApp for goal sync:", wsErr);
          }
        }

        return updatedTeam;
      }
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized goals for ${Object.keys(goalsMap).length} teams.`,
      data: goalsMap,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
