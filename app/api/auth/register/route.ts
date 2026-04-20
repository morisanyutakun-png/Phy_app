import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/user";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "メールアドレスと8文字以上のパスワードを入力してください" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "このメールアドレスは既に登録されています" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = await createSession({ uid: user.id, email: user.email });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, userId: user.id });
}
