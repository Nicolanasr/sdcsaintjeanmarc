import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

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

    return NextResponse.json({
      stats: {
        ticketsSold,
        cashCollected: ticketsSold * 5,
      },
      totalTicketsCount,
      leaderboard,
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

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
