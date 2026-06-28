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

import { TICKET_PRICE } from "@/lib/constants";

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

    // Find the scoutId of the tickets (they should all be for the same scout)
    const firstTicket = await prisma.ticket.findFirst({
      where: { id: { in: numericIds } },
      select: { scoutId: true },
    });

    if (!firstTicket || !firstTicket.scoutId) {
      return NextResponse.json({ error: "No tickets found or tickets not associated with a scout" }, { status: 400 });
    }

    const scoutId = firstTicket.scoutId;
    const adminId = (isAdmin.userId || isAdmin.id) as string;

    // Perform database operations in a transaction
    const [updateResult, settlement] = await prisma.$transaction([
      prisma.ticket.updateMany({
        where: {
          id: { in: numericIds },
          paymentMethod: "CASH",
        },
        data: {
          cashSettled: true,
        },
      }),
      prisma.cashSettlement.create({
        data: {
          scoutId,
          adminId,
          amount: numericIds.length * TICKET_PRICE,
          ticketCount: numericIds.length,
          ticketIds: numericIds.join(","),
        },
      }),
    ]);

    return NextResponse.json({ success: true, count: updateResult.count, settlement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing settlement ID parameter" }, { status: 400 });
    }

    const settlementId = Number(id);
    if (isNaN(settlementId)) {
      return NextResponse.json({ error: "Invalid settlement ID format" }, { status: 400 });
    }

    // Find the settlement first
    const settlement = await prisma.cashSettlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
    }

    // Parse the ticket IDs
    const ticketIds = settlement.ticketIds
      .split(",")
      .map((tid) => Number(tid))
      .filter((tid) => !isNaN(tid));

    // Revert tickets to cashSettled: false and delete settlement log in transaction
    await prisma.$transaction([
      prisma.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { cashSettled: false },
      }),
      prisma.cashSettlement.delete({
        where: { id: settlementId },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Settlement reverted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
