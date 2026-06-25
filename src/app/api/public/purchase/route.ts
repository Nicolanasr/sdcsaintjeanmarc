import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const phoneValidationRules: Record<
  string,
  {
    validate: (local: string) => boolean;
    error: string;
  }
> = {
  "961": {
    validate: (local) => {
      const startsWithThree = local.startsWith("3");
      const expected = startsWithThree ? 7 : 8;
      return local.length === expected;
    },
    error: "Lebanese numbers starting with 3 must be exactly 7 digits, otherwise 8 digits."
  },
  "971": {
    validate: (local) => local.length === 9 && local.startsWith("5"),
    error: "UAE mobile numbers must start with 5 and be exactly 9 digits."
  },
  "966": {
    validate: (local) => local.length === 9 && local.startsWith("5"),
    error: "Saudi mobile numbers must start with 5 and be exactly 9 digits."
  },
  "974": {
    validate: (local) => local.length === 8 && /^[3567]/.test(local),
    error: "Qatar mobile numbers must start with 3, 5, 6, or 7 and be exactly 8 digits."
  },
  "1": {
    validate: (local) => local.length === 10,
    error: "US/Canada numbers must be exactly 10 digits."
  },
  "44": {
    validate: (local) => local.length === 10 && local.startsWith("7"),
    error: "UK mobile numbers must start with 7 and be exactly 10 digits."
  },
  "33": {
    validate: (local) => local.length === 9 && /^[67]/.test(local),
    error: "France mobile numbers must start with 6 or 7 and be exactly 9 digits."
  }
};

export async function POST(request: Request) {
  try {
    const { buyerName, buyerPhone, teamId, quantity = 1, locale = "en" } = await request.json();

    if (!buyerName || !buyerPhone || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanPhone = buyerPhone.replace(/\D/g, "");
    
    // Find matching prefix
    const matchingPrefix = Object.keys(phoneValidationRules)
      .sort((a, b) => b.length - a.length)
      .find((prefix) => cleanPhone.startsWith(prefix));

    if (matchingPrefix) {
      const localPart = cleanPhone.substring(matchingPrefix.length);
      const rule = phoneValidationRules[matchingPrefix];
      if (!rule.validate(localPart)) {
        return NextResponse.json({ error: rule.error }, { status: 400 });
      }
    } else {
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        return NextResponse.json({ error: "Invalid phone number length (must be between 7 and 15 digits)" }, { status: 400 });
      }
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 50) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create tickets in a loop
    const createdTickets = [];
    for (let i = 0; i < qty; i++) {
      const ticket = await prisma.ticket.create({
        data: {
          buyerName,
          buyerPhone,
          teamId,
          paymentStatus: "PENDING",
          paymentMethod: "WHISH",
        },
      });
      createdTickets.push(ticket);
    }

    const ticketIds = createdTickets.map((t) => t.id).join(",");

    // Generate redirect URL to simulated checkout gateway
    const redirectUrl = `/${locale}/scout-world-cup/buy/whish-gateway?ticket_ids=${ticketIds}`;

    return NextResponse.json({ success: true, redirectUrl, ticketIds });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
