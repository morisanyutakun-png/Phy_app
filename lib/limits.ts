import { prisma } from "@/lib/db";

export const FREE_DAILY_LIMIT = 3;
export const PRO_DAILY_LIMIT = 200;

export function jstDateKey(d: Date = new Date()): string {
  // Shift UTC -> JST (+09:00), then format as YYYY-MM-DD.
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface UsageStatus {
  used: number;
  limit: number;
  plan: "FREE" | "PRO";
  canAnalyze: boolean;
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = (user?.plan ?? "FREE") as "FREE" | "PRO";
  const limit = plan === "PRO" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const dateKey = jstDateKey();
  const row = await prisma.usageDaily.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });
  const used = row?.count ?? 0;
  return { used, limit, plan, canAnalyze: used < limit };
}

export async function incrementUsage(userId: string): Promise<void> {
  const dateKey = jstDateKey();
  await prisma.usageDaily.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    update: { count: { increment: 1 } },
    create: { userId, dateKey, count: 1 },
  });
}
