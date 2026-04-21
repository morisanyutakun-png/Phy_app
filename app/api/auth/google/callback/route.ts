import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { exchangeCodeForToken, fetchGoogleUserInfo } from "@/lib/auth/google";

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
    return errorRedirect(req, "Googleログインがキャンセルされました");
  }

  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return errorRedirect(req, "不正なリクエストです（state 不一致）");
  }

  let profile;
  try {
    const { accessToken } = await exchangeCodeForToken(code);
    profile = await fetchGoogleUserInfo(accessToken);
  } catch {
    return errorRedirect(req, "Googleとの通信に失敗しました");
  }

  if (!profile.verified) {
    return errorRedirect(req, "Googleアカウントのメールが未確認です");
  }

  // Link by googleId if present, else by email (existing password account).
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
}
