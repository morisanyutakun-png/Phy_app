import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { getUsageStatus } from "@/lib/limits";
import { MISCONCEPTIONS } from "@/lib/misconceptions";
import type { MisconceptionTag } from "@/types/analysis";

const UNIT_LABEL: Record<string, string> = {
  HORIZONTAL: "水平面",
  INCLINE: "斜面",
  SPRING: "ばね",
  CIRCULAR: "円運動",
  PROJECTILE: "投射",
  UNKNOWN: "その他",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const usage = await getUsageStatus(user.id);

  const recent = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const forTagCalc = await prisma.analysis.findMany({
    where: { userId: user.id },
    select: { mistakeTags: true, unit: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const tagCounts = new Map<string, number>();
  const unitCounts = new Map<string, number>();
  for (const a of forTagCalc) {
    unitCounts.set(a.unit, (unitCounts.get(a.unit) ?? 0) + 1);
    for (const t of a.mistakeTags ?? []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const recommendedUnit = recommendUnit(unitCounts);

  return (
    <div className="space-y-6">
      <section className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="今日の使用回数"
          value={`${usage.used} / ${usage.limit}`}
          hint={
            usage.canAnalyze
              ? "あと " + (usage.limit - usage.used) + " 回"
              : "本日の無料枠は終了しました"
          }
        />
        <StatCard
          title="累計の解析"
          value={String(forTagCalc.length)}
          hint="直近50件を学習分析の対象にしています"
        />
        <StatCard
          title="プラン"
          value={usage.plan}
          hint={
            usage.plan === "FREE"
              ? "Pro で解析上限・詳細解説が開きます"
              : "Proプランを利用中"
          }
          cta={
            usage.plan === "FREE" ? (
              <Link className="btn-primary text-xs px-3 py-1.5" href="/pricing">
                Proにする
              </Link>
            ) : null
          }
        />
      </section>

      <section className="grid md:grid-cols-[1.3fr_1fr] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">
              新しい問題図を解析する
            </h2>
            <Link href="/upload" className="btn-primary text-sm">
              アップロード
            </Link>
          </div>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            教科書の図、問題集の写真、自作の模式図、どれでも OK。アップロードすると、力・速度・加速度の矢印候補が重なって表示されます。
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-ink">おすすめ単元</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {recommendedUnit
              ? `最近の苦手傾向から ${UNIT_LABEL[recommendedUnit]} の問題を試すとよさそうです。`
              : "まずは得意な単元から1問解析してみましょう。"}
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-[1.3fr_1fr] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">最近の履歴</h2>
            <Link href="/history" className="text-sm text-brand">
              すべて見る →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              まだ履歴がありません。
              <Link className="text-brand ml-1" href="/upload">
                最初の1問を解析する
              </Link>
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/5">
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-ink">
                      {a.title ?? "解析"}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      {UNIT_LABEL[a.unit] ?? a.unit} ・{" "}
                      {new Date(a.createdAt).toLocaleString("ja-JP")}
                    </div>
                  </div>
                  <Link
                    href={`/analysis/${a.id}`}
                    className="btn-secondary text-xs"
                  >
                    見る
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-ink">苦手傾向</h2>
          {topTags.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              履歴が増えると、誤解の種類がここに集計されます。
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {topTags.map(([tag, count]) => {
                const info = MISCONCEPTIONS[tag as MisconceptionTag];
                if (!info) return null;
                return (
                  <li
                    key={tag}
                    className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-amber-900">
                        {info.label}
                      </div>
                      <span className="text-xs text-amber-800">
                        {count}回
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                      {info.short}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  cta,
}: {
  title: string;
  value: string;
  hint?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-ink-muted tracking-wide uppercase">
          {title}
        </div>
        {cta}
      </div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}

function recommendUnit(unitCounts: Map<string, number>): string | null {
  const units = ["INCLINE", "CIRCULAR", "PROJECTILE", "SPRING", "HORIZONTAL"];
  const seen = new Set(Array.from(unitCounts.keys()));
  for (const u of units) if (!seen.has(u)) return u;
  return (
    [...unitCounts.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? null
  );
}
