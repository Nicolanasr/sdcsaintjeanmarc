import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { sendWhatsAppMessage, sendMatchWinWhatsAppSummary } from "@/lib/whatsapp";

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

    const winsMap: Record<string, number> = {};

    matches.forEach((match: any) => {
      if (match.status === "FINISHED" || match.status === "IN_PLAY") {
        const homeCode = match.homeTeam.tla || match.homeTeam.id?.toString();
        const awayCode = match.awayTeam.tla || match.awayTeam.id?.toString();

        const winner = match.score?.winner;
        if (winner === "HOME_TEAM" && homeCode) {
          winsMap[homeCode] = (winsMap[homeCode] || 0) + 1;
        } else if (winner === "AWAY_TEAM" && awayCode) {
          winsMap[awayCode] = (winsMap[awayCode] || 0) + 1;
        }
      }
    });

    const winningTeams: any[] = [];

    // Update teams in Prisma database
    const updates = Object.entries(winsMap).map(async ([teamId, wins]) => {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, name: true, totalWins: true, flagUrl: true },
      });

      if (team) {
        const winsDiff = wins - team.totalWins;

        const updatedTeam = await prisma.team.update({
          where: { id: teamId },
          data: { totalWins: wins },
        });

        if (winsDiff > 0) {
          winningTeams.push({
            id: team.id,
            name: team.name,
            flagUrl: team.flagUrl,
            totalWins: wins,
          });
        }

        return updatedTeam;
      }
    });

    await Promise.all(updates);

    // Send unified WhatsApp summary alerts if there are winning teams
    if (winningTeams.length > 0) {
      try {
        const settings = await getWhatsAppSettings();
        if (settings.sendOnGoal) {
          const winningTeamIds = winningTeams.map((t) => t.id);
          const tickets = await prisma.ticket.findMany({
            where: { teamId: { in: winningTeamIds }, paymentStatus: "PAID" },
            select: { buyerPhone: true, buyerName: true },
          });

          // Group by unique phone number
          const uniqueBuyers = new Map<string, string>();
          tickets.forEach((ticket) => {
            const phone = ticket.buyerPhone.trim();
            if (!uniqueBuyers.has(phone)) {
              uniqueBuyers.set(phone, ticket.buyerName);
            }
          });

          for (const [phone, name] of uniqueBuyers.entries()) {
            await sendMatchWinWhatsAppSummary(phone, name, winningTeams);
          }
        }
      } catch (wsErr) {
        console.error("Failed to send unified match win WhatsApp summary alerts:", wsErr);
      }
    }


    return NextResponse.json({
      success: true,
      message: `Successfully synchronized wins for ${Object.keys(winsMap).length} teams.`,
      data: winsMap,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
