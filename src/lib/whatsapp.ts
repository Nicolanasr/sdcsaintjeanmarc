import { prisma } from "@/lib/prisma";

export function formatWhatsAppChatId(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return `${trimmed.replace(/\D/g, "")}@c.us`;
  }

  let cleaned = trimmed.replace(/\D/g, "");
  
  // If local Lebanese number without country code (usually 7 or 8 digits)
  if (cleaned.length === 7 && cleaned.startsWith("3")) {
    cleaned = "961" + cleaned;
  } else if (cleaned.length === 8 && (cleaned.startsWith("70") || cleaned.startsWith("71") || cleaned.startsWith("76") || cleaned.startsWith("78") || cleaned.startsWith("79") || cleaned.startsWith("81") || cleaned.startsWith("03"))) {
    if (cleaned.startsWith("03")) {
      cleaned = "961" + cleaned.substring(1);
    } else {
      cleaned = "961" + cleaned;
    }
  } else if (cleaned.length === 8 && cleaned.startsWith("3") && !cleaned.startsWith("33")) {
    cleaned = "961" + cleaned;
  }
  
  return `${cleaned}@c.us`;
}

export async function sendWhatsAppMessage(phone: string, text: string): Promise<boolean> {
  const chatId = formatWhatsAppChatId(phone);
  const wahaUrl = "https://waha.nicolasnasr.space/api/sendText";
  const apiKey = "scout_world_cup_2026_secret_key";

  console.log(`[WAHA] Attempting to send message to ${chatId} using session: default`);
  console.log(`[WAHA] URL: ${wahaUrl}`);

  let status = "FAILED";
  let errorMsg: string | null = null;

  try {
    const res = await fetch(wahaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        chatId,
        text,
        session: "default",
      }),
    });

    const resText = await res.text();
    console.log(`[WAHA] Response Status: ${res.status} ${res.statusText}`);
    console.log(`[WAHA] Response Body:`, resText);

    if (!res.ok) {
      console.error(`[WAHA] Failed to send message. HTTP ${res.status} - ${resText}`);
      errorMsg = `HTTP ${res.status}: ${resText}`;
    } else {
      status = "SENT";
    }
  } catch (err: any) {
    errorMsg = err.message || String(err);
    console.error("[WAHA] Request encountered an error:", errorMsg);
  }

  // Persist attempt in database log table
  try {
    await prisma.whatsAppLog.create({
      data: {
        phone,
        body: text,
        status,
        error: errorMsg,
      },
    });
    console.log(`[WAHA] Logged message to database for ${phone} with status: ${status}`);
  } catch (dbErr) {
    console.error("[WAHA] Failed to write WhatsApp log to database:", dbErr);
  }

  return status === "SENT";
}

export function getTeamFlagEmoji(flagUrl: string | null | undefined, teamId: string): string {
  if (!flagUrl) return "⚽";
  try {
    const filename = flagUrl.split("/").pop() || "";
    let code = filename.replace(".svg", "").toLowerCase();
    if (code === "gb-eng") {
      code = "gb";
    }
    if (code.length === 2) {
      const char1 = code.charCodeAt(0) - 97 + 127462;
      const char2 = code.charCodeAt(1) - 97 + 127462;
      return String.fromCodePoint(char1, char2);
    }
  } catch (err) {
    // Ignore error and fall through
  }
  return "⚽";
}

export async function sendMatchWinWhatsAppSummary(
  buyerPhone: string,
  buyerName: string,
  winningTeams: { id: string; name: string; flagUrl: string; totalWins: number }[]
): Promise<boolean> {
  const buyerTickets = await prisma.ticket.findMany({
    where: { buyerPhone, paymentStatus: "PAID" },
    include: { team: true },
  });

  if (buyerTickets.length === 0) return false;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Group by teamId
  const teamGroups: Record<string, {
    teamName: string;
    flagUrl: string;
    totalWins: number;
    ticketIds: number[];
  }> = {};

  buyerTickets.forEach((ticket) => {
    const team = ticket.team;
    if (!teamGroups[ticket.teamId]) {
      teamGroups[ticket.teamId] = {
        teamName: team.name,
        flagUrl: team.flagUrl,
        totalWins: team.totalWins,
        ticketIds: [],
      };
    }
    teamGroups[ticket.teamId].ticketIds.push(ticket.id);
  });

  let totalEntries = 0;
  Object.values(teamGroups).forEach((group) => {
    totalEntries += group.ticketIds.length * (1 + group.totalWins);
  });

  const winningTeamNamesWithFlags = winningTeams.map((wt) => {
    const flag = getTeamFlagEmoji(wt.flagUrl, wt.id);
    return `${wt.name} ${flag}`;
  }).join(", ");

  const ticketListEn = Object.values(teamGroups).map((group) => {
    const flag = getTeamFlagEmoji(group.flagUrl, "");
    const ids = group.ticketIds.map((id) => `#${id}`).join(", ");
    const entries = group.ticketIds.length * (1 + group.totalWins);
    return `${flag} ${group.teamName}: ${group.ticketIds.length} ticket(s) (${ids}) ➔ ${entries} entries (${group.totalWins} wins)`;
  }).join("\n");

  const ticketListAr = Object.values(teamGroups).map((group) => {
    const flag = getTeamFlagEmoji(group.flagUrl, "");
    const ids = group.ticketIds.map((id) => `#${id}`).join("، ");
    const entries = group.ticketIds.length * (1 + group.totalWins);
    return `${flag} ${group.teamName}: عدد ${group.ticketIds.length} بطاقات (${ids}) ➔ ${entries} فرص (${group.totalWins} انتصارات)`;
  }).join("\n");

  const msgAr = `المنتخب الذي شجعته (${winningTeamNamesWithFlags}) قد فاز في مباراته! ⚽️\n\nإليك ملخص لبطاقاتك النشطة وفرص السحب الخاصة بك:\n${ticketListAr}\n\nإجمالي الفرص في السحب: ${totalEntries} فرص!\n\nتابع ترتيب المنتخبات وبطاقاتك هنا:\n${baseUrl}/ar/scout-world-cup/standings?phone=${buyerPhone}`;

  const msgEn = `Your supported team (${winningTeamNamesWithFlags}) has won their match! ⚽️\n\nHere is a summary of your active tickets and raffle entries:\n${ticketListEn}\n\nTotal Raffle Entries: ${totalEntries} entries!\n\nTrack team standings and your tickets here:\n${baseUrl}/en/scout-world-cup/standings?phone=${buyerPhone}`;

  const fullMsg = `${msgAr}\n\n-----------------\n\n${msgEn}`;

  return await sendWhatsAppMessage(buyerPhone, fullMsg);
}

