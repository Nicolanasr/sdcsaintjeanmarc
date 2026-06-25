import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { ticketIds, whishTransactionId } = await request.json();

    if (!ticketIds || !whishTransactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ids: number[] = [];
    if (Array.isArray(ticketIds)) {
      ids.push(...ticketIds.map((id: any) => parseInt(id)));
    } else {
      ids.push(...String(ticketIds).split(",").map((id: any) => parseInt(id)));
    }

    const numericIds = ids.filter((id) => !isNaN(id));
    if (numericIds.length === 0) {
      return NextResponse.json({ error: "No valid ticket IDs" }, { status: 400 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { id: { in: numericIds } },
    });

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: "Tickets not found" }, { status: 404 });
    }

    // Save transaction ID and keep as PENDING
    await prisma.ticket.updateMany({
      where: { id: { in: numericIds } },
      data: {
        whishTransactionId: whishTransactionId.trim(),
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true, count: numericIds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
