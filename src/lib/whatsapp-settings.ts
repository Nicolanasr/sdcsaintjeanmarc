import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "src/lib/whatsapp-settings.json");

export interface WhatsAppSettings {
  sendOnPurchase: boolean;
  sendOnGoal: boolean;
}

const defaultSettings: WhatsAppSettings = {
  sendOnPurchase: true,
  sendOnGoal: false,
};

export function getWhatsAppSettings(): WhatsAppSettings {
  try {
    if (!fs.existsSync(settingsPath)) {
      // Ensure the directory exists
      const dir = path.dirname(settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const content = fs.readFileSync(settingsPath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading WhatsApp settings:", err);
    return defaultSettings;
  }
}

export function saveWhatsAppSettings(settings: WhatsAppSettings): boolean {
  try {
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving WhatsApp settings:", err);
    return false;
  }
}
