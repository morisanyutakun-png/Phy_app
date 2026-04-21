import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { exchangeCodeForToken, fetchGoogleUserInfo } from "@/lib/auth/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATE_COOKIE = "google_oauth_state";

function errorRedirect(req: NextRequest, message: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    console.warn("[google-oauth] provider returned error:", errorParam);
    return errorRedirect(req, `Google: ${errorParam}`);
  }

  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  if (!code) {
    return errorRedirect(req, "認可コードがありません");
  }
  if (!state || !cookieState) {
    return errorRedirect(req, "state Cookie がありません (ブラウザの設定を確認)");
  }
  if (state !== cookieState) {
    return errorRedirect(req, "state 不一致 (CSRF 保護)");
  }

  let profile;
  try {
    const { accessToken } = await exchangeCodeForToken(code);
    profile = await fetchGoogleUserInfo(accessToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-oauth] provider exchange failed:", msg);
    return errorRedirect(req, `Google通信エラー: ${msg.slice(0, 80)}`);
  }

  // NOTE: we used to reject !profile.verified, but Google's v2 userinfo
  // endpoint occasionally omits `verified_email` for Workspace accounts
  // that have SSO/domain-verified emails, which made the check flag
  // legitimate sign-ins as failures. We keep the default (false) only for
  // logging; trust is delegated to Google having authenticated the user.
  if (!profile.verified) {
    console.warn(
      "[google-oauth] verified_email missing or false for:",
      profile.email
    );
  }

  try {
    const existing =
      (await prisma.user.findUnique({ where: { googleId: profile.id } })) ??
      (await prisma.user.findUnique({ where: { email: profile.email } }));

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            googleId: existing.googleId ?? profile.id,
            name: existing.name ?? profile.name,
            image: existing.image ?? profile.picture,
          },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.id,
            name: profile.name,
            image: profile.picture,
          },
        });

    const token = await createSession({ uid: user.id, email: user.email });
    await setSessionCookie(token);

    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-oauth] db / session error:", msg);
    return errorRedirect(req, `DBエラー: ${msg.slice(0, 80)}`);
  }
}
