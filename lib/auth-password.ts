export const MIN_PASSWORD_LENGTH = 8;
/** bcrypt truncates beyond 72 bytes; cap early to avoid DoS via very long passwords. */
export const MAX_PASSWORD_LENGTH = 72;

export type PasswordValidationResult = { ok: true } | { ok: false; error: string };

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return { ok: false, error: "Password is required." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`,
    };
  }
  return { ok: true };
}

/** Error message when a Google-only account tries email/password login. */
export function getPasswordLoginBlockMessage(user: { password: string | null }): string | null {
  if (!user.password) {
    return "This account uses Google sign-in. Please use Continue with Google.";
  }
  return null;
}
