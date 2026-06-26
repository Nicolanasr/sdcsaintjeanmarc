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

    const [ticketsSold, pendingWhish, totalTickets] = await Promise.all([
      prisma.ticket.count({ where: { paymentStatus: "PAID" } }),
      prisma.ticket.count({ where: { paymentStatus: "PENDING" } }),
      prisma.ticket.count(),
    ]);

    return NextResponse.json({ ticketsSold, pendingWhish, totalTickets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
