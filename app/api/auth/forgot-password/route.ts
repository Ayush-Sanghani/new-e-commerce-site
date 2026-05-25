import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeAuthEmail } from "@/lib/auth-email";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
} from "@/lib/password-reset";

function validateBody(body: unknown): { email: string } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }
  const { email } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Email is required." };
  }
  if (!isValidEmail(email)) {
    return { error: "Invalid email format." };
  }

  return { email: normalizeAuthEmail(email) };
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

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (user?.password) {
      const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();

      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.create({
          data: { userId: user.id, tokenHash, expiresAt },
        }),
      ]);

      const resetUrl = buildPasswordResetUrl(rawToken);
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        name: user.name,
      });

      if (!emailResult.sent) {
        console.error("Forgot password: email not sent for", user.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: FORGOT_PASSWORD_SUCCESS_MESSAGE,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_PUBLIC_APP_URL")) {
      return NextResponse.json(
        { success: false, error: "Server configuration error." },
        { status: 500 }
      );
    }
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
