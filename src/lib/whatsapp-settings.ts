import { prisma } from "./prisma";

export interface WhatsAppSettings {
  sendOnPurchase: boolean;
  sendOnGoal: boolean;
}

const defaultSettings: WhatsAppSettings = {
  sendOnPurchase: true,
  sendOnGoal: false,
};

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "whatsapp_settings" },
    });
    if (setting) {
      return JSON.parse(setting.value);
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
