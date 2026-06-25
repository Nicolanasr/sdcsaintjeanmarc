import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || searchParams.get("id");

    if (!query) {
      return NextResponse.json({ error: "Missing query or ticket id" }, { status: 400 });
    }

    // Clean/sanitize the search query (remove spaces, plus signs, dashes, etc.)
    const cleanQuery = query.replace(/[\s+-]/g, "");

    // Check if it's a numeric ticket ID (usually short, e.g. <= 6 digits)
    const isTicketId = /^\d+$/.test(cleanQuery) && cleanQuery.length <= 6;

    if (isTicketId) {
      const ticketId = parseInt(cleanQuery);
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          team: true,
          scout: {
            select: { fullName: true },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }

      return NextResponse.json({ type: "single", ticket });
    } else {
      // Query by buyer phone number (exactly matches the cleaned phone number)
      const tickets = await prisma.ticket.findMany({
        where: {
          buyerPhone: {
            equals: cleanQuery,
          },
        },
        include: {
          team: true,
          scout: {
            select: { fullName: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!tickets || tickets.length === 0) {
        return NextResponse.json({ error: "No tickets found for this phone number" }, { status: 404 });
      }

      return NextResponse.json({ type: "multi", tickets });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
