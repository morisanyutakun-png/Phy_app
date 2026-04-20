import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function getCurrentUser() {
  const s = await readSession();
  if (!s) return null;
  const user = await prisma.user.findUnique({ where: { id: s.uid } });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
