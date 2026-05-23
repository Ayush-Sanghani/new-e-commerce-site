import { prisma } from "@/lib/db";
import { normalizeGoogleEmail, resolveGoogleUser, type GoogleProfile } from "@/lib/google-user";
import { Role } from "@prisma/client";

export async function upsertUserFromGoogleProfile(profile: GoogleProfile) {
  const byGoogleId = await prisma.user.findUnique({
    where: { googleId: profile.sub },
    select: { id: true, email: true, googleId: true, password: true, role: true },
  });

  const byEmail = await prisma.user.findUnique({
    where: { email: normalizeGoogleEmail(profile.email) },
    select: { id: true, email: true, googleId: true, password: true, role: true },
  });

  const existing = byGoogleId ?? byEmail;
  const resolution = resolveGoogleUser(existing, profile);

  if (resolution.action === "error") {
    return { error: resolution.message } as const;
  }

  if (resolution.action === "login") {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: resolution.userId },
      select: { id: true, email: true, role: true },
    });
    return { user } as const;
  }

  if (resolution.action === "link") {
    const user = await prisma.user.update({
      where: { id: resolution.userId },
      data: { googleId: resolution.googleId },
      select: { id: true, email: true, role: true },
    });
    return { user } as const;
  }

  const user = await prisma.user.create({
    data: {
      email: resolution.email,
      name: resolution.name,
      googleId: resolution.googleId,
      role: Role.user,
    },
    select: { id: true, email: true, role: true },
  });
  return { user } as const;
}
