import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
