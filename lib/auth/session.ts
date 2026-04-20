import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "arrow_session";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set it in .env (32+ chars)."
    );
  }
  return new TextEncoder().encode(raw);
}

export interface SessionPayload {
  uid: string;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.uid === "string" && typeof payload.email === "string") {
      return { uid: payload.uid, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
