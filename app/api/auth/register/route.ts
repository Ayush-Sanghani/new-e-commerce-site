import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateBody(body: unknown): { name?: string; email: string; password: string; role?: Role } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }
  const { name, email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Email is required." };
  }
  if (!isValidEmail(email)) {
    return { error: "Invalid email format." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "Password is required." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  const result: { name?: string; email: string; password: string; role?: Role } = {
    email: email.trim().toLowerCase(),
    password,
  };
  if (typeof name === "string" && name.trim()) result.name = name.trim();
  // if (role === "admin" || role === "user") result.role = role;
  return result;
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceAuthRateLimit(request, "register");
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

    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name ?? null,
        password: hashedPassword,
        role: validated.role ?? "user",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful.",
      user,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
