import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { getUsageStatus } from "@/lib/limits";
import { MISCONCEPTIONS } from "@/lib/misconceptions";
import type { MisconceptionTag } from "@/types/analysis";
import { PROBLEMS, UNIT_LABEL, UNIT_ORDER, type PhysUnit, type Problem } from "@/lib/problems";

const UNIT_LABEL_JA: Record<string, string> = {
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
  const isPro = usage.plan === "PRO";

  const [recent, analyses] = await Promise.all([
    prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.analysis.findMany({
      where: { userId: user.id },
      select: { mistakeTags: true, unit: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tagCounts = new Map<string, number>();
  const unitCounts = new Map<string, number>();
  for (const a of analyses) {
    unitCounts.set(a.unit, (unitCounts.get(a.unit) ?? 0) + 1);
    for (const t of a.mistakeTags ?? []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const featured = pickFeaturedProblems(unitCounts, isPro);
  const recommendedUnit = recommendUnit(unitCounts);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          おかえりなさい
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          今日もアニメーションで物理を一つ、体に入れていきましょう。
        </p>
      </section>

      {/* Featured problems — library-centric hero */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="chip bg-brand-light text-brand-dark border border-brand/10 mb-2">
              今日の学習
            </div>
            <h2 className="text-lg font-bold text-ink">
              {recommendedUnit
                ? `おすすめ：${UNIT_LABEL[recommendedUnit]}`
                : "まずはここから"}
            </h2>
          </div>
          <Link href="/library" className="text-sm text-brand font-semibold">
            ライブラリを全部見る →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {featured.map((p) => (
            <FeaturedTile key={p.slug} problem={p} isPro={isPro} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="プラン"
          value={usage.plan}
          hint={
            isPro
              ? "全問題 + 詳細解説が開放中"
              : `FREE では ${PROBLEMS.filter((p) => p.tier === "FREE").length} 問が無料`
          }
          cta={
            !isPro ? (
              <Link className="btn-primary text-xs px-3 py-1.5" href="/pricing">
                Proにする
              </Link>
            ) : null
          }
        />
        <StatCard
          title="今日の解析回数"
          value={`${usage.used} / ${usage.limit}`}
          hint={
            usage.canAnalyze
              ? `残り ${usage.limit - usage.used} 回（自分の問題アップロード用）`
              : "本日の解析枠は使い切りました"
          }
        />
        <StatCard
          title="累計の学習"
          value={String(analyses.length)}
          hint={`解析履歴の総数（直近 50 件を苦手分析に使用）`}
        />
      </section>

      {/* Two-column: recent + weakness */}
      <section className="grid md:grid-cols-[1.3fr_1fr] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-ink">最近の解析</h2>
            <Link href="/history" className="text-sm text-brand font-semibold">
              すべて見る →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-ink-muted">
                まだ自分の問題を解析していません。
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Link href="/library" className="btn-primary text-sm">
                  ライブラリから学ぶ
                </Link>
                <Link href="/upload" className="btn-secondary text-sm">
                  自分の問題をアップ
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-ink/5">
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
                      {UNIT_LABEL_JA[a.unit] ?? a.unit} ・{" "}
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
          <h2 className="text-base font-bold text-ink">苦手傾向</h2>
          {topTags.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              学習履歴が増えると、誤解の種類がここに集計されます。
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
                      <span className="text-xs text-amber-800">{count}回</span>
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

function FeaturedTile({ problem, isPro }: { problem: Problem; isPro: boolean }) {
  const locked = problem.tier === "PRO" && !isPro;
  return (
    <Link
      href={locked ? "/pricing" : `/library/${problem.slug}`}
      className="group card p-5 relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center justify-between">
        <span className="chip bg-ink/5 text-ink-muted text-[10px]">
          {UNIT_LABEL[problem.unit]} ・ {problem.level}
        </span>
        {problem.tier === "PRO" ? (
          <span className="chip bg-gradient-to-r from-[#FF375F] to-[#FF9F0A] text-white text-[10px]">
            PRO
          </span>
        ) : (
          <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
            FREE
          </span>
        )}
      </div>
      <h3 className="mt-3 text-base font-bold text-ink group-hover:text-brand transition">
        {problem.title}
      </h3>
      <p className="mt-1.5 text-xs text-ink-muted leading-relaxed line-clamp-2">
        {problem.summary}
      </p>
      {locked && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-xs font-semibold text-ink bg-white shadow-md rounded-full px-3 py-1.5">
            🔒 Proで開放
          </div>
        </div>
      )}
    </Link>
  );
}

function pickFeaturedProblems(
  unitCounts: Map<string, number>,
  isPro: boolean
): Problem[] {
  // Favor an unexplored FREE problem, then the user's most-studied unit.
  const unexplored = PROBLEMS.filter(
    (p) => !unitCounts.has(p.unit) && (isPro || p.tier === "FREE")
  );
  const byUnit: Record<PhysUnit, Problem[]> = {
    HORIZONTAL: [],
    INCLINE: [],
    SPRING: [],
    CIRCULAR: [],
    PROJECTILE: [],
  };
  for (const p of PROBLEMS) byUnit[p.unit].push(p);

  // Pick one from each of the first three units in UNIT_ORDER, preferring FREE tier.
  const picks: Problem[] = [];
  for (const u of UNIT_ORDER) {
    const list = byUnit[u].filter((p) => isPro || p.tier === "FREE");
    if (list.length > 0 && picks.length < 3) picks.push(list[0]);
  }
  if (picks.length < 3 && unexplored.length > 0) picks.push(unexplored[0]);
  return picks.slice(0, 3);
}

function recommendUnit(unitCounts: Map<string, number>): PhysUnit | null {
  const seen = new Set(Array.from(unitCounts.keys()));
  for (const u of UNIT_ORDER) if (!seen.has(u)) return u;
  const entries = [...unitCounts.entries()].sort((a, b) => a[1] - b[1]);
  const first = entries[0]?.[0] as PhysUnit | undefined;
  return first ?? null;
}
