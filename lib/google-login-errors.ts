const GOOGLE_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    "Google sign-in is not set up yet. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXT_PUBLIC_APP_URL to your environment.",
  google_denied: "Google sign-in was cancelled.",
  google_failed: "Google sign-in failed. Please try again.",
  google_invalid_state: "Google sign-in session expired. Please try again.",
  google_account: "Could not sign in with this Google account. Try email and password instead.",
};

export function getGoogleLoginErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return GOOGLE_LOGIN_ERROR_MESSAGES[code] ?? "Google sign-in failed. Please try again.";
}
