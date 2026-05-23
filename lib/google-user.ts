export type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  email_verified?: boolean;
};

export type ExistingGoogleUser = {
  id: string;
  email: string;
  googleId: string | null;
  password: string | null;
};

export type GoogleUserResolution =
  | { action: "create"; email: string; name: string | null; googleId: string }
  | { action: "login"; userId: string }
  | { action: "link"; userId: string; googleId: string }
  | { action: "error"; message: string };

export function normalizeGoogleEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function resolveGoogleUser(
  existing: ExistingGoogleUser | null,
  profile: GoogleProfile
): GoogleUserResolution {
  if (!profile.email?.trim()) {
    return { action: "error", message: "Google did not provide an email address." };
  }
  if (profile.email_verified === false) {
    return { action: "error", message: "Google email is not verified." };
  }

  const email = normalizeGoogleEmail(profile.email);
  const googleId = profile.sub;

  if (!existing) {
    return {
      action: "create",
      email,
      name: profile.name?.trim() || null,
      googleId,
    };
  }

  if (existing.googleId && existing.googleId !== googleId) {
    return { action: "error", message: "Google account does not match this user." };
  }

  if (existing.googleId === googleId) {
    return { action: "login", userId: existing.id };
  }

  if (existing.email === email) {
    return { action: "link", userId: existing.id, googleId };
  }

  return { action: "error", message: "Unable to sign in with Google for this account." };
}
