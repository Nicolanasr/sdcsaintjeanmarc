import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

export async function POST(request: Request) {
  try {
    const token = request.headers.get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const defaultTeams = [
      { id: "ARG", name: "Argentina", flagUrl: "https://flagcdn.com/ar.svg" },
      { id: "BRA", name: "Brazil", flagUrl: "https://flagcdn.com/br.svg" },
      { id: "FRA", name: "France", flagUrl: "https://flagcdn.com/fr.svg" },
      { id: "GER", name: "Germany", flagUrl: "https://flagcdn.com/de.svg" },
      { id: "ESP", name: "Spain", flagUrl: "https://flagcdn.com/es.svg" },
      { id: "ENG", name: "England", flagUrl: "https://flagcdn.com/gb-eng.svg" },
      { id: "POR", name: "Portugal", flagUrl: "https://flagcdn.com/pt.svg" },
      { id: "ITA", name: "Italy", flagUrl: "https://flagcdn.com/it.svg" },
      { id: "USA", name: "USA", flagUrl: "https://flagcdn.com/us.svg" },
      { id: "MEX", name: "Mexico", flagUrl: "https://flagcdn.com/mx.svg" },
      { id: "MAR", name: "Morocco", flagUrl: "https://flagcdn.com/ma.svg" },
      { id: "SEN", name: "Senegal", flagUrl: "https://flagcdn.com/sn.svg" },
    ];

    // Seed/Upsert default teams
    for (const t of defaultTeams) {
      await prisma.team.upsert({
        where: { id: t.id },
        update: { name: t.name, flagUrl: t.flagUrl },
        create: t,
      });
    }

    return NextResponse.json({ success: true, message: "Teams seeded successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
