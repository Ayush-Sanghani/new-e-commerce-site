import { createHash, randomBytes } from "crypto";

export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  "If an account exists with that email, you will receive a password reset link shortly.";

export function hashPasswordResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function createPasswordResetToken(): {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const rawToken = randomBytes(32).toString("base64url");
  return {
    rawToken,
    tokenHash: hashPasswordResetToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
  };
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }
  return url.replace(/\/$/, "");
}

export function buildPasswordResetUrl(rawToken: string): string {
  const base = getAppBaseUrl();
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export function isPasswordResetTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
