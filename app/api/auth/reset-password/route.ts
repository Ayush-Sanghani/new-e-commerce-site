import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  hashPasswordResetToken,
  isPasswordResetTokenExpired,
} from "@/lib/password-reset";

const MIN_PASSWORD_LENGTH = 8;
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
  if (typeof password !== "string" || !password) {
    return { error: "Password is required." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  return { token: token.trim(), password };
}

export async function POST(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can sign in now.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
