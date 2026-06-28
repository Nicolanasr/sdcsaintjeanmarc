import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

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

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profiles = await prisma.profile.findMany({
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

    const leaderboard = profiles
      .map((p) => ({
        id: p.id,
        full_name: p.fullName,
        unit: p.unit,
        tickets_count: p.tickets.length,
      }))
      .filter((p) => p.tickets_count > 0)
      .sort((a, b) => b.tickets_count - a.tickets_count);

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

    profiles.forEach((p) => {
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

    return NextResponse.json({ leaderboard, unitLeaderboard });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
