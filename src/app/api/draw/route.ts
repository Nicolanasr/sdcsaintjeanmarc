import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication & Admin Role
    const token = request.headers.get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: any = null;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin role required" },
        { status: 403 }
      );
    }

    let prizeName = "Grand Prize 🥇";
    try {
      const body = await request.json();
      if (body.prizeName) prizeName = body.prizeName.trim();
    } catch {
      // ignore
    }

    // 2. Fetch all tickets and teams (exclude tickets that have already won a prize)
    const tickets = await prisma.ticket.findMany({
      where: {
        paymentStatus: "PAID",
        winner: null, // Exclude past winners
      },
      select: {
        id: true,
        buyerName: true,
        buyerPhone: true,
        teamId: true,
        scoutId: true,
      },
    });

    const teams = await prisma.team.findMany();
    const teamsMap = new Map(teams.map((t) => [t.id, t]));

    // 3. Compile the weighted raffle pool
    const rafflePool: any[] = [];

    tickets.forEach((ticket) => {
      const team = teamsMap.get(ticket.teamId);
      if (!team) return;

      // Every ticket gets 1 guaranteed entry + 1 entry per team win
      const entriesCount = 1 + (team.totalWins || 0);

      for (let i = 0; i < entriesCount; i++) {
        rafflePool.push(ticket);
      }
    });

    if (rafflePool.length === 0) {
      return NextResponse.json(
        { error: "Raffle pool is empty or all paid tickets have already won prizes." },
        { status: 400 }
      );
    }

    // 4. Securely select unique winners
    const winners: any[] = [];
    const chosenTicketIds = new Set<number>();

    let pool = [...rafflePool];
    const uniqueTicketsCount = new Set(pool.map((t) => t.id)).size;
    const targetWinnersCount = Math.min(1, uniqueTicketsCount);

    while (winners.length < targetWinnersCount && pool.length > 0) {
      const randomIndex = crypto.randomInt(0, pool.length);
      const candidate = pool[randomIndex];

      if (!chosenTicketIds.has(candidate.id)) {
        winners.push(candidate);
        chosenTicketIds.add(candidate.id);
      }

      pool = pool.filter((t) => t.id !== candidate.id);
    }

    const winner = winners[0];
    if (!winner) {
      return NextResponse.json({ error: "No winner chosen" }, { status: 400 });
    }

    // 5. Persist winner draw to the database
    const createdWinner = await prisma.winner.create({
      data: {
        ticketId: winner.id,
        prizeName,
      },
      include: {
        ticket: {
          select: {
            id: true,
            buyerName: true,
            buyerPhone: true,
            teamId: true,
            scoutId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      poolSize: rafflePool.length,
      winners: [createdWinner.ticket],
      winnerRecord: createdWinner,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
