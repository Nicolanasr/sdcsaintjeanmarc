import { prisma } from "./prisma";

export interface WhatsAppSettings {
  sendOnPurchase: boolean;
  sendOnGoal: boolean;
  templatePurchaseAr?: string;
  templatePurchaseEn?: string;
}

const defaultSettings: WhatsAppSettings = {
  sendOnPurchase: true,
  sendOnGoal: false,
  templatePurchaseAr: "شكرًا لشرائك تذكرة مسابقة سحب كأس الكشافة رقم #{ticketId} لدعم فوج مار يوحنا مرقس - كشافة الأرز! فريقك المختار هو {teamName}. كل فوز يحققه هذا الفريق يمنحك فرصة إضافية في السحب النهائي! ⚽️\n\nتابع تذكرتك ونقاط فريقك من هنا:\n{trackingLink}\n\nسيتم إعلان الفائز على صفحتنا على إنستغرام، تأكد من متابعتنا وتفعيل التنبيهات! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/",
  templatePurchaseEn: "Thank you for purchasing World Cup Scout Cup Draw ticket #{ticketId} supporting Scouts des Cèdres Saint Jean Marc! Your selected team is {teamName}. Every win they achieve grants you an extra entry in the final raffle! ⚽️\n\nTrack your ticket and team entries here:\n{trackingLink}\n\nWinners will be announced on our Instagram page, make sure to follow us and turn on notifications! 📲\nhttps://www.instagram.com/sdc_saintjeanmarc/",
};

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "whatsapp_settings" },
    });
    if (setting) {
      const parsed = JSON.parse(setting.value);
      return {
        ...defaultSettings,
        ...parsed,
        templatePurchaseAr: parsed.templatePurchaseAr || defaultSettings.templatePurchaseAr,
        templatePurchaseEn: parsed.templatePurchaseEn || defaultSettings.templatePurchaseEn,
      };
    }
    // Seed default settings into the DB if not present
    await prisma.systemSetting.create({
      data: {
        key: "whatsapp_settings",
        value: JSON.stringify(defaultSettings),
      },
    });
    return defaultSettings;
  } catch (err) {
    console.error("Error reading WhatsApp settings from DB:", err);
    return defaultSettings;
  }
}

export async function saveWhatsAppSettings(settings: WhatsAppSettings): Promise<boolean> {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "whatsapp_settings" },
      update: { value: JSON.stringify(settings) },
      create: { key: "whatsapp_settings", value: JSON.stringify(settings) },
    });
    return true;
  } catch (err) {
    console.error("Error saving WhatsApp settings to DB:", err);
    throw err;
  }
}
