/** Error message when a Google-only account tries email/password login. */
export function getPasswordLoginBlockMessage(user: { password: string | null }): string | null {
  if (!user.password) {
    return "This account uses Google sign-in. Please use Continue with Google.";
  }
  return null;
}
