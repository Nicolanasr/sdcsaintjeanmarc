/**
 * /api/admin/reports
 *
 * GET with query params for server-side filtering + cursor pagination:
 *   ?limit=50
 *   &cursor=<lastTicketId>      (for next page)
 *   &search=<text>              (buyerName, buyerPhone, ticket id)
 *   &scoutId=<id>
 *   &teamId=<id>
 *   &paymentMethod=CASH|WHISH
 *   &paymentStatus=PAID|PENDING|REJECTED
 *
 * Returns: { tickets, nextCursor, hasMore, total }
 * `total` is the COUNT matching the filters (for display — uses DB count, not JS)
 */
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);
    const cursor = searchParams.get("cursor") ? Number(searchParams.get("cursor")) : undefined;
    const search = searchParams.get("search")?.trim() || "";
    const scoutId = searchParams.get("scoutId") || "";
    const teamId = searchParams.get("teamId") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    // Build the where clause dynamically
    const where: any = {};

    if (cursor) {
      where.id = { lt: cursor };
    }

    if (scoutId) {
      where.scoutId = scoutId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod.toUpperCase();
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus.toUpperCase();
    }

    // Full-text search: ticket id, buyerName, buyerPhone
    if (search) {
      const ticketIdSearch = Number(search);
      where.OR = [
        { buyerName: { contains: search, mode: "insensitive" } },
        { buyerPhone: { contains: search, mode: "insensitive" } },
        ...(isNaN(ticketIdSearch) ? [] : [{ id: ticketIdSearch }]),
      ];
    }

    // Run count and fetch in parallel (count uses same where but no cursor/limit)
    const whereForCount = { ...where };
    delete whereForCount.id; // remove cursor from count

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        select: {
          id: true,
          buyerName: true,
          buyerPhone: true,
          paymentMethod: true,
          paymentStatus: true,
          whishTransactionId: true,
          cashSettled: true,
          createdAt: true,
          scout: { select: { id: true, fullName: true, unit: true } },
          team: { select: { id: true, name: true, flagUrl: true } },
        },
        orderBy: { id: "desc" },
        take: limit + 1,
      }),
      prisma.ticket.count({ where: whereForCount }),
    ]);

    const hasMore = tickets.length > limit;
    if (hasMore) tickets.pop();
    const nextCursor = hasMore ? tickets[tickets.length - 1]?.id : null;

    return NextResponse.json({ tickets, nextCursor, hasMore, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
