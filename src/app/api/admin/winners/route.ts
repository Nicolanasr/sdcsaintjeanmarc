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

// GET: Return all drawings with full details (for admin panel)
export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const winners = await prisma.winner.findMany({
      include: {
        ticket: {
          select: {
            id: true,
            buyerName: true,
            buyerPhone: true,
            team: {
              select: {
                id: true,
                name: true,
                flagUrl: true,
              },
            },
            scout: {
              select: {
                id: true,
                fullName: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { drawnAt: "desc" },
    });

    return NextResponse.json({ winners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Undo a drawing (deletes the Winner record)
export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing winner ID parameter" }, { status: 400 });
    }

    const winnerId = Number(id);
    if (isNaN(winnerId)) {
      return NextResponse.json({ error: "Invalid winner ID format" }, { status: 400 });
    }

    await prisma.winner.delete({
      where: { id: winnerId },
    });

    return NextResponse.json({ success: true, message: "Draw entry deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
