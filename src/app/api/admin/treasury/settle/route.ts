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

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketIds } = await request.json();
    if (!Array.isArray(ticketIds)) {
      return NextResponse.json({ error: "ticketIds must be an array of numbers" }, { status: 400 });
    }

    const numericIds = ticketIds.map((id) => Number(id)).filter((id) => !isNaN(id));

    if (numericIds.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const { count } = await prisma.ticket.updateMany({
      where: {
        id: { in: numericIds },
        paymentMethod: "CASH",
      },
      data: {
        cashSettled: true,
      },
    });

    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
