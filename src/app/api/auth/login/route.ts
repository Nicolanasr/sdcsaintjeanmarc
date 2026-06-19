import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const profile = await prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const valid = await bcrypt.compare(password, profile.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = await new SignJWT({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 500 }
    );
  }
}
