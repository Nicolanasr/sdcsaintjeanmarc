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
