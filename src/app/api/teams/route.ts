import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

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

    const { id, totalGoals, podiumFinish, isEliminated } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing team id" }, { status: 400 });
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        totalGoals: totalGoals !== undefined ? totalGoals : undefined,
        podiumFinish: podiumFinish !== undefined ? podiumFinish : undefined,
        isEliminated: isEliminated !== undefined ? isEliminated : undefined,
      },
    });

    return NextResponse.json({ team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
