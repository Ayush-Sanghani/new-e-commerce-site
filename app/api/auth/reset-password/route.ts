import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { clearAuthCookie } from "@/lib/auth-cookie";
import { validatePassword } from "@/lib/auth-password";
import { prisma } from "@/lib/db";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import {
  hashPasswordResetToken,
  isPasswordResetTokenExpired,
} from "@/lib/password-reset";

const SALT_ROUNDS = 10;

function validateBody(
  body: unknown
): { token: string; password: string } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }
  const { token, password } = body as Record<string, unknown>;

  if (typeof token !== "string" || !token.trim()) {
    return { error: "Reset token is required." };
  }
  const passwordResult = validatePassword(typeof password === "string" ? password : "");
  if (!passwordResult.ok) {
    return { error: passwordResult.error };
  }

  return { token: token.trim(), password: password as string };
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceAuthRateLimit(request, "reset-password");
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

    const tokenHash = hashPasswordResetToken(validated.token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!resetRecord || isPasswordResetTokenExpired(resetRecord.expiresAt)) {
      if (resetRecord) {
        await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      }
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: resetRecord.userId } }),
    ]);

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully. You can sign in now.",
    });
    clearAuthCookie(response);
    return response;
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
