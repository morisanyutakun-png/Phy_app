import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl } from "@/lib/auth/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATE_COOKIE = "google_oauth_state";

export async function GET(_req: NextRequest) {
  const state = randomBytes(24).toString("hex");
  const url = buildAuthorizeUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
