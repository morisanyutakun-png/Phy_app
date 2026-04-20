import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { getUsageStatus } from "@/lib/limits";
import { MISCONCEPTIONS } from "@/lib/misconceptions";
import type { MisconceptionTag } from "@/types/analysis";

const UNITS: Array<{ key: string; label: string }> = [
  { key: "ALL", label: "すべて" },
  { key: "HORIZONTAL", label: "水平面" },
  { key: "INCLINE", label: "斜面" },
  { key: "SPRING", label: "ばね" },
  { key: "CIRCULAR", label: "円運動" },
  { key: "PROJECTILE", label: "投射" },
];

const UNIT_LABEL: Record<string, string> = {
  HORIZONTAL: "水平面",
  INCLINE: "斜面",
  SPRING: "ばね",
  CIRCULAR: "円運動",
  PROJECTILE: "投射",
  UNKNOWN: "その他",
};

const FREE_HISTORY_LIMIT = 10;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { unit?: string };
}) {
  const user = await requireUser();
  const usage = await getUsageStatus(user.id);
  const unit = (searchParams.unit ?? "ALL").toUpperCase();

  const where: Record<string, unknown> = { userId: user.id };
  if (unit !== "ALL") where.unit = unit;

  const take = usage.plan === "PRO" ? 200 : FREE_HISTORY_LIMIT;
  const items = await prisma.analysis.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: { upload: true },
  });
  const totalCount = await prisma.analysis.count({ where });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">学習履歴</h1>
        <Link href="/upload" className="btn-primary text-sm">
          新しく解析する
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {UNITS.map((u) => {
          const active = unit === u.key;
          return (
            <Link
              key={u.key}
              href={u.key === "ALL" ? "/history" : `/history?unit=${u.key}`}
              className={
                active
                  ? "chip bg-ink text-white"
                  : "chip bg-white border border-ink/10 text-ink-muted hover:bg-ink/5"
              }
            >
              {u.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-muted">
            この単元での履歴はまだありません。
          </p>
          <Link href="/upload" className="btn-primary mt-4 inline-flex">
            解析する
          </Link>
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {items.map((a) => (
            <li key={a.id} className="card overflow-hidden">
              <Link href={`/analysis/${a.id}`} className="block">
                <div className="aspect-video bg-ink-soft/5 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.upload.blobUrl}
                    alt={a.title ?? ""}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="chip bg-brand-light text-brand-dark">
                      {UNIT_LABEL[a.unit] ?? a.unit}
                    </span>
                    <span className="text-ink-muted">
                      {new Date(a.createdAt).toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-ink">
                    {a.title ?? "解析"}
                  </h3>
                  {a.mistakeTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.mistakeTags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="chip bg-amber-50 text-amber-900 border border-amber-200"
                        >
                          {MISCONCEPTIONS[t as MisconceptionTag]?.label ?? t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {usage.plan === "FREE" && totalCount > FREE_HISTORY_LIMIT && (
        <div className="card p-4 text-sm text-ink-muted flex items-center justify-between">
          <div>
            無料プランでは直近 {FREE_HISTORY_LIMIT} 件のみ表示されます（全 {totalCount} 件）。
          </div>
          <Link className="btn-primary text-xs" href="/pricing">
            Proで全履歴を見る
          </Link>
        </div>
      )}
    </div>
  );
}
