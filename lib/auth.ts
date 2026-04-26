import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

/**
 * Returns the current user from JWT cookie + DB, or null if missing/invalid.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

/**
 * Admin-only. Verifies JWT and that the user still exists with role admin in the DB.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: SessionUser } | { error: string; status: number }> {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: "Unauthorized. Sign in required.", status: 401 };
  }
  if (user.role !== Role.admin) {
    return { error: "Forbidden. Admin access required.", status: 403 };
  }
  return { user };
}
