import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { prisma } from "./prisma";

const JWT_COOKIE_NAME = "auth_token";
const JWT_EXPIRES_IN = "30d"; // 30 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(userId: string): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);

  return token;
}

export async function verifyAuthToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload?.sub || typeof payload.sub !== "string") return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  return user;
}

export { JWT_COOKIE_NAME };

