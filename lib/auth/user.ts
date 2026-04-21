import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

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
