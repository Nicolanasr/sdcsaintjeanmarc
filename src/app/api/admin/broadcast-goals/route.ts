import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { sendWhatsAppMessage, getTeamFlagEmoji } from "@/lib/whatsapp";

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

    const { teamId, messageText } = await request.json();
    if (!teamId || !messageText) {
      return NextResponse.json({ error: "Missing teamId or messageText" }, { status: 400 });
    }

    // 1. Fetch team details
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // 2. Fetch all paid tickets for this team
    const tickets = await prisma.ticket.findMany({
      where: {
        teamId,
        paymentStatus: "PAID",
      },
      select: {
        buyerName: true,
        buyerPhone: true,
        id: true,
      },
    });

    if (tickets.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No paid tickets found for this team" });
    }

    // 3. Group tickets by buyerPhone to avoid sending multiple messages to the same person
    const buyerMap = new Map<string, { buyerName: string; tickets: number[] }>();
    for (const ticket of tickets) {
      const phone = ticket.buyerPhone.trim();
      if (!buyerMap.has(phone)) {
        buyerMap.set(phone, { buyerName: ticket.buyerName, tickets: [] });
      }
      buyerMap.get(phone)!.tickets.push(ticket.id);
    }

    // 4. Send messages to each unique buyer
    let successCount = 0;
    const errors: string[] = [];

    // Send in sequence or use Promise.all. Seq is safer for WhatsApp rate limits.
    for (const [phone, data] of buyerMap.entries()) {
      // Interpolate templates variables:
      // {buyerName} -> Full Name
      // {teamName} -> Team Name (e.g. Argentina)
      // {ticketsCount} -> Number of tickets bought for this team
      // {ticketIds} -> List of ticket IDs
      // {bonusEntries} -> total entries (1 + team.totalWins) * ticketsCount
      const ticketsCount = data.tickets.length;
      const totalWins = team.totalWins || 0;
      const bonusEntries = (1 + totalWins) * ticketsCount;
      const ticketIdsList = data.tickets.map(id => `#${id}`).join(", ");

      const flagEmoji = getTeamFlagEmoji(team.flagUrl, team.id);
      const interpolated = messageText
        .replace(/{buyerName}/g, data.buyerName)
        .replace(/{teamName}/g, `${team.name} ${flagEmoji}`)
        .replace(/{ticketsCount}/g, String(ticketsCount))
        .replace(/{ticketIds}/g, ticketIdsList)
        .replace(/{bonusEntries}/g, String(bonusEntries));

      const success = await sendWhatsAppMessage(phone, interpolated);
      if (success) {
        successCount++;
      } else {
        errors.push(phone);
      }
    }

    return NextResponse.json({
      success: true,
      totalBuyers: buyerMap.size,
      sentCount: successCount,
      failedCount: buyerMap.size - successCount,
      failedPhones: errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
