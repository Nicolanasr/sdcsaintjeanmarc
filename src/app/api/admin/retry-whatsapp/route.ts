import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { formatWhatsAppChatId } from "@/lib/whatsapp";

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

    let logId: number | undefined;
    try {
      const body = await request.json();
      logId = body.logId ? Number(body.logId) : undefined;
    } catch (e) {
      // Request might not contain body, ignore
    }

    const whereClause: any = { status: "FAILED" };
    if (logId) {
      whereClause.id = logId;
    }

    // Find WhatsApp logs to retry
    const failedLogs = await prisma.whatsAppLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });

    if (failedLogs.length === 0) {
      return NextResponse.json({ success: true, message: "No failed messages to retry", count: 0 });
    }

    const wahaUrl = "https://waha.nicolasnasr.space/api/sendText";
    const apiKey = "scout_world_cup_2026_secret_key";
    let successCount = 0;

    for (const log of failedLogs) {
      const chatId = formatWhatsAppChatId(log.phone);
      try {
        const res = await fetch(wahaUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
          },
          body: JSON.stringify({
            chatId,
            text: log.body,
            session: "default",
          }),
        });

        if (res.ok) {
          // Update the existing failed log to SENT and clear error
          await prisma.whatsAppLog.update({
            where: { id: log.id },
            data: {
              status: "SENT",
              error: null,
            },
          });
          successCount++;
        } else {
          const resText = await res.text();
          await prisma.whatsAppLog.update({
            where: { id: log.id },
            data: {
              error: `HTTP ${res.status}: ${resText}`,
            },
          });
        }
      } catch (err: any) {
        await prisma.whatsAppLog.update({
          where: { id: log.id },
          data: {
            error: err.message || String(err),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Retried ${failedLogs.length} messages. Successfully sent ${successCount}.`,
      count: successCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
