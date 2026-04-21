import { z } from "zod";

const AUTHZ_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function googleClientId(): string {
  return required("GOOGLE_CLIENT_ID");
}

function googleClientSecret(): string {
  return required("GOOGLE_CLIENT_SECRET");
}

export function googleRedirectUri(): string {
  const appUrl = required("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
  return `${appUrl}/api/auth/google/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: googleClientId(),
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${AUTHZ_URL}?${params.toString()}`;
}

const tokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().optional(),
  id_token: z.string().optional(),
  token_type: z.string().optional(),
});

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
}> {
  const body = new URLSearchParams({
    code,
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    redirect_uri: googleRedirectUri(),
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status}`);
  }
  const parsed = tokenSchema.parse(await res.json());
  return { accessToken: parsed.access_token };
}

const userInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  verified_email: z.boolean().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
});

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified: boolean;
  name: string | null;
  picture: string | null;
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo failed: ${res.status}`);
  }
  const parsed = userInfoSchema.parse(await res.json());
  return {
    id: parsed.id,
    email: parsed.email.toLowerCase(),
    verified: parsed.verified_email ?? false,
    name: parsed.name ?? null,
    picture: parsed.picture ?? null,
  };
}
