/**
 * /api/admin/treasury
 *
 * GET ?mode=summary   → Full financial overview (WHISH + CASH) using DB aggregations only
 * GET ?mode=ledger    → Per-scout cash ledger using groupBy (no full table scan)
 * GET ?mode=drill&scoutId=<id> → Paginated CASH tickets for a single scout
 *   optional: &cursor=<lastId>&limit=50
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { TICKET_PRICE } from "@/lib/constants";

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
    const mode = searchParams.get("mode") || "summary";

    // ─────────────────────────────────────────────────────────────
    // MODE: summary  —  full financial picture using COUNT / GROUP BY
    // ─────────────────────────────────────────────────────────────
    if (mode === "summary") {
      const [
        cashPaidCount,
        whishPaidCount,
        whishPendingCount,
        whishRejectedCount,
        cashPendingHandoverCount,
        cashSettledCount,
        totalTicketsCount,
      ] = await Promise.all([
        // Confirmed CASH tickets
        prisma.ticket.count({ where: { paymentMethod: "CASH", paymentStatus: "PAID" } }),
        // Confirmed WHISH tickets
        prisma.ticket.count({ where: { paymentMethod: "WHISH", paymentStatus: "PAID" } }),
        // WHISH awaiting verification
        prisma.ticket.count({ where: { paymentMethod: "WHISH", paymentStatus: "PENDING" } }),
        // Rejected WHISH
        prisma.ticket.count({ where: { paymentMethod: "WHISH", paymentStatus: "REJECTED" } }),
        // CASH collected but not yet handed over to admin
        prisma.ticket.count({ where: { paymentMethod: "CASH", paymentStatus: "PAID", cashSettled: false } }),
        // CASH already handed over
        prisma.ticket.count({ where: { paymentMethod: "CASH", paymentStatus: "PAID", cashSettled: true } }),
        // Grand total all tickets ever created
        prisma.ticket.count(),
      ]);

      const cashRevenue = cashPaidCount * TICKET_PRICE;
      const whishRevenue = whishPaidCount * TICKET_PRICE;
      const totalRevenue = cashRevenue + whishRevenue;
      const whishPendingValue = whishPendingCount * TICKET_PRICE;
      const cashOutstanding = cashPendingHandoverCount * TICKET_PRICE;
      const cashSettledValue = cashSettledCount * TICKET_PRICE;
      const settlementRate = cashRevenue > 0
        ? Math.round((cashSettledValue / cashRevenue) * 100)
        : 0;

      return NextResponse.json({
        summary: {
          // Revenue
          totalRevenue,
          cashRevenue,
          whishRevenue,
          // Ticket counts
          totalTicketsCount,
          cashPaidCount,
          whishPaidCount,
          // WHISH pipeline
          whishPendingCount,
          whishPendingValue,
          whishRejectedCount,
          // Cash settlement
          cashOutstanding,
          cashSettledValue,
          cashPendingHandoverCount,
          cashSettledCount,
          settlementRate,
        },
      });
    }

    // ─────────────────────────────────────────────────────────────
    // MODE: ledger  —  per-scout cash summary using groupBy (no full scan)
    // ─────────────────────────────────────────────────────────────
    if (mode === "ledger") {
      // DB-level groupBy: count tickets per (scoutId, cashSettled)
      const groups = await prisma.ticket.groupBy({
        by: ["scoutId", "cashSettled"],
        where: { paymentMethod: "CASH", paymentStatus: "PAID" },
        _count: { id: true },
      });

      // Get all scout profiles
      const scouts = await prisma.profile.findMany({
        select: { id: true, fullName: true, unit: true, role: true },
      });
      const scoutIndex = new Map(scouts.map((s) => [s.id, s]));

      // Build per-scout totals from the group results
      const ledgerMap = new Map<string, {
        id: string; fullName: string; unit: string | null;
        pendingCount: number; settledCount: number;
      }>();

      for (const group of groups) {
        const scoutId = group.scoutId || "unknown";
        const scout = scoutIndex.get(scoutId) || { id: scoutId, fullName: "Unknown Scout", unit: null, role: "scout" };
        if (!ledgerMap.has(scoutId)) {
          ledgerMap.set(scoutId, { id: scoutId, fullName: scout.fullName, unit: scout.unit, pendingCount: 0, settledCount: 0 });
        }
        const entry = ledgerMap.get(scoutId)!;
        if (group.cashSettled) entry.settledCount += group._count.id;
        else entry.pendingCount += group._count.id;
      }

      // Also add scouts with 0 tickets but role=scout
      for (const [id, scout] of scoutIndex) {
        if (!ledgerMap.has(id)) {
          if (scout.role === "scout") {
            ledgerMap.set(id, { id, fullName: scout.fullName, unit: scout.unit, pendingCount: 0, settledCount: 0 });
          }
        }
      }

      const ledger = Array.from(ledgerMap.values()).map((entry) => ({
        id: entry.id,
        fullName: entry.fullName,
        unit: entry.unit,
        totalCashCollected: (entry.pendingCount + entry.settledCount) * TICKET_PRICE,
        pendingCashHandover: entry.pendingCount * TICKET_PRICE,
        settledCash: entry.settledCount * TICKET_PRICE,
        pendingCount: entry.pendingCount,
        settledCount: entry.settledCount,
      })).sort((a, b) => b.pendingCashHandover - a.pendingCashHandover);

      return NextResponse.json({ ledger });
    }

    // ─────────────────────────────────────────────────────────────
    // MODE: drill  —  paginated tickets for a single scout
    // ─────────────────────────────────────────────────────────────
    if (mode === "drill") {
      const scoutId = searchParams.get("scoutId");
      if (!scoutId) return NextResponse.json({ error: "scoutId required" }, { status: 400 });

      const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
      const cursor = searchParams.get("cursor") ? Number(searchParams.get("cursor")) : undefined;

      const tickets = await prisma.ticket.findMany({
        where: {
          scoutId,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          ...(cursor ? { id: { lt: cursor } } : {}),
        },
        select: {
          id: true,
          buyerName: true,
          buyerPhone: true,
          createdAt: true,
          cashSettled: true,
        },
        orderBy: { id: "desc" },
        take: limit + 1, // fetch one extra to detect next page
      });

      const hasMore = tickets.length > limit;
      if (hasMore) tickets.pop();
      const nextCursor = hasMore ? tickets[tickets.length - 1]?.id : null;

      return NextResponse.json({ tickets, nextCursor, hasMore });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
