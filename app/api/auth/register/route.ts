import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import {
  buildVerifyEmailUrl,
  createEmailVerificationToken,
} from "@/lib/email-verification";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { validatePassword } from "@/lib/auth-password";
import { isValidEmail } from "@/lib/auth-email";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

const SALT_ROUNDS = 10;

const UNVERIFIED_EMAIL_REGISTER_MESSAGE =
  "An account with this email is pending verification. Check your inbox or use resend verification on the login page.";

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
  const passwordResult = validatePassword(typeof password === "string" ? password : "");
  if (!passwordResult.ok) {
    return { error: passwordResult.error };
  }

  const result: { name?: string; email: string; password: string; role?: Role } = {
    email: email.trim().toLowerCase(),
    password: password as string,
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
      select: { id: true, email: true, name: true, emailVerifiedAt: true },
    });
    if (existing?.emailVerifiedAt) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    if (existing && !existing.emailVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          error: UNVERIFIED_EMAIL_REGISTER_MESSAGE,
          code: "email_pending_verification",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, SALT_ROUNDS);

    const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
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

      await tx.emailVerificationToken.create({
        data: { userId: created.id, tokenHash, expiresAt },
      });

      return created;
    });

    const verifyUrl = buildVerifyEmailUrl(rawToken);
    const emailResult = await sendVerificationEmail({
      to: user.email,
      verifyUrl,
      name: user.name,
    });

    if (!emailResult.sent) {
      console.error("Register: verification email not sent for", user.email);
    }

    return NextResponse.json({
      success: true,
      message: "Check your email to verify your account.",
      user,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("JWT_SECRET") || err.message.includes("NEXT_PUBLIC_APP_URL"))
    ) {
      return NextResponse.json(
        { success: false, error: "Server configuration error." },
        { status: 500 }
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
