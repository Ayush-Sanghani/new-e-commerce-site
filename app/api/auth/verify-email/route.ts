import { NextRequest, NextResponse } from "next/server";
import { attachAuthCookie } from "@/lib/auth-cookie";
import { prisma } from "@/lib/db";
import {
  hashEmailVerificationToken,
  isEmailVerificationTokenExpired,
} from "@/lib/email-verification";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

function validateBody(body: unknown): { token: string } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }
  const { token } = body as Record<string, unknown>;

  if (typeof token !== "string" || !token.trim()) {
    return { error: "Verification token is required." };
  }

  return { token: token.trim() };
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceAuthRateLimit(request, "verify-email");
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

    const tokenHash = hashEmailVerificationToken(validated.token);
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        user: {
          select: { id: true, email: true, name: true, role: true, emailVerifiedAt: true },
        },
      },
    });

    if (
      !verificationRecord ||
      isEmailVerificationTokenExpired(verificationRecord.expiresAt)
    ) {
      if (verificationRecord) {
        await prisma.emailVerificationToken.delete({
          where: { id: verificationRecord.id },
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification link. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const user = verificationRecord.user;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationRecord.userId },
        data: {
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { userId: verificationRecord.userId },
      }),
    ]);

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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
    console.error("Verify email error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to verify email. Please try again." },
      { status: 500 }
    );
  }
}
