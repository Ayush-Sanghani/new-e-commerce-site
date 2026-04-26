import * as jose from "jose";

const COOKIE_MAX_AGE_DAYS = 7;
export const JWT_EXPIRATION = `${COOKIE_MAX_AGE_DAYS}d`;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be set in .env and be at least 32 characters for HS256."
    );
  }
  return new TextEncoder().encode(secret);
}

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const secret = getSecret();
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<jose.JWTPayload & JwtPayload> {
  const secret = getSecret();
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as jose.JWTPayload & JwtPayload;
}
