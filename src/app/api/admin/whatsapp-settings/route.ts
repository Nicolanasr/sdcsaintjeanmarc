import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getWhatsAppSettings, saveWhatsAppSettings } from "@/lib/whatsapp-settings";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

// Helper to verify admin
async function isAdmin(request: Request) {
  const token = request.headers.get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const settings = getWhatsAppSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { sendOnPurchase, sendOnGoal } = await request.json();
    if (sendOnPurchase === undefined || sendOnGoal === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const success = saveWhatsAppSettings({ sendOnPurchase, sendOnGoal });
    if (!success) {
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: { sendOnPurchase, sendOnGoal } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
