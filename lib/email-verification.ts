import { createHash, randomBytes } from "crypto";

export const VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const RESEND_VERIFICATION_SUCCESS_MESSAGE =
  "If an account exists with that email and is not yet verified, you will receive a verification link shortly.";

export function hashEmailVerificationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function createEmailVerificationToken(): {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const rawToken = randomBytes(32).toString("base64url");
  return {
    rawToken,
    tokenHash: hashEmailVerificationToken(rawToken),
    expiresAt: new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS),
  };
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }
  return url.replace(/\/$/, "");
}

export function buildVerifyEmailUrl(rawToken: string): string {
  const base = getAppBaseUrl();
  return `${base}/verify-email?token=${encodeURIComponent(rawToken)}`;
}

export function isEmailVerificationTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
