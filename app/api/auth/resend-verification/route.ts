import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeAuthEmail } from "@/lib/auth-email";
import { sendVerificationEmail } from "@/lib/email";
import {
  buildVerifyEmailUrl,
  createEmailVerificationToken,
  RESEND_VERIFICATION_SUCCESS_MESSAGE,
} from "@/lib/email-verification";
import { prisma } from "@/lib/db";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

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

async function sendVerificationForUser(user: {
  id: string;
  email: string;
  name: string | null;
}) {
  const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    }),
  ]);

  const verifyUrl = buildVerifyEmailUrl(rawToken);
  const emailResult = await sendVerificationEmail({
    to: user.email,
    verifyUrl,
    name: user.name,
  });

  if (!emailResult.sent) {
    console.error("Verification email not sent for", user.email);
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceAuthRateLimit(request, "resend-verification");
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
      select: { id: true, email: true, name: true, password: true, emailVerifiedAt: true },
    });

    if (user?.password && !user.emailVerifiedAt) {
      await sendVerificationForUser(user);
    }

    return NextResponse.json({
      success: true,
      message: RESEND_VERIFICATION_SUCCESS_MESSAGE,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_PUBLIC_APP_URL")) {
      return NextResponse.json(
        { success: false, error: "Server configuration error." },
        { status: 500 }
      );
    }
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
