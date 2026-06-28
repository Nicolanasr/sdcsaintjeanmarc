import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskPhone(phone: string): string {
  const p = phone.trim();
  if (p.length <= 6) return "***";
  // e.g. "+961 76 123456" -> "+961 76 ****56"
  const start = p.slice(0, -6);
  const end = p.slice(-2);
  return `${start}****${end}`;
}

export async function GET() {
  try {
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
          },
        },
      },
      orderBy: { drawnAt: "desc" },
    });

    const publicWinners = winners.map((w) => ({
      id: w.id,
      prizeName: w.prizeName,
      drawnAt: w.drawnAt,
      ticket: {
        id: w.ticket.id,
        buyerName: w.ticket.buyerName,
        buyerPhone: maskPhone(w.ticket.buyerPhone),
        team: w.ticket.team,
      },
    }));

    return NextResponse.json({ winners: publicWinners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
