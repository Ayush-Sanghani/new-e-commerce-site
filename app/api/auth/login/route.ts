import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { attachAuthCookie } from "@/lib/auth-cookie";
import { getPasswordLoginBlockMessage } from "@/lib/auth-password";
import { prisma } from "@/lib/db";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateBody(body: unknown): { email: string; password: string } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }
  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Email is required." };
  }
  if (!isValidEmail(email)) {
    return { error: "Invalid email format." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "Password is required." };
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceAuthRateLimit(request, "login");
  if (rateLimited) return rateLimited;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const validated = validateBody(body);
    if ("error" in validated) {
      return NextResponse.json(
        { success: false, error: validated.error },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordBlock = getPasswordLoginBlockMessage(user);
    if (passwordBlock) {
      return NextResponse.json({ success: false, error: passwordBlock }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(validated.password, user.password!);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Please verify your email before signing in.",
          code: "email_not_verified",
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

    await attachAuthCookie(response, user);
    return response;
  } catch (err) {
    if (err instanceof Error && err.message.includes("JWT_SECRET")) {
      return NextResponse.json(
        { success: false, error: "Server configuration error." },
        { status: 500 }
      );
    }
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
