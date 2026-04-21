import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import {
  PROBLEMS,
  UNIT_LABEL,
  UNIT_ORDER,
  type PhysUnit,
  type Problem,
} from "@/lib/problems";

export default async function LibraryPage() {
  const user = await requireUser();
  const isPro = user.plan === "PRO";

  const byUnit: Record<PhysUnit, Problem[]> = {
    HORIZONTAL: [],
    INCLINE: [],
    SPRING: [],
    CIRCULAR: [],
    PROJECTILE: [],
  };
  for (const p of PROBLEMS) byUnit[p.unit].push(p);

  const totalFree = PROBLEMS.filter((p) => p.tier === "FREE").length;
  const totalPro = PROBLEMS.filter((p) => p.tier === "PRO").length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="chip bg-brand-light text-brand-dark border border-brand/10">
          定番問題ライブラリ
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          矢印とアニメーションで物理を理解する
        </h1>
        <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
          高校物理・力学の定番問題を、インタラクティブなシミュレーションと矢印解説で学べます。パラメータを動かすと、力・速度・加速度の矢印が実時間で追従します。
        </p>
        <div className="text-xs text-ink-muted flex items-center gap-3 pt-2">
          <span>無料: {totalFree} 問</span>
          <span className="w-px h-3 bg-ink/10" />
          <span>Pro: +{totalPro} 問</span>
          {!isPro && (
            <Link href="/pricing" className="ml-auto text-brand font-semibold">
              Proで全問開放 →
            </Link>
          )}
        </div>
      </header>

      {UNIT_ORDER.map((u) => (
        <section key={u}>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-bold text-ink">{UNIT_LABEL[u]}</h2>
            <div className="text-xs text-ink-muted">
              {byUnit[u].length} 問
            </div>
          </div>
          {byUnit[u].length === 0 ? (
            <EmptyShelf unit={u} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {byUnit[u].map((p) => (
                <ProblemTile key={p.slug} problem={p} isPro={isPro} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function ProblemTile({ problem, isPro }: { problem: Problem; isPro: boolean }) {
  const locked = problem.tier === "PRO" && !isPro;
  return (
    <Link
      href={locked ? "/pricing" : `/library/${problem.slug}`}
      className="card p-4 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition relative"
    >
      <div className="flex items-center justify-between">
        <span className="chip bg-ink/5 text-ink-muted">{problem.level}</span>
        {problem.tier === "PRO" ? (
          <span className="chip bg-gradient-to-r from-[#FF375F] to-[#FF9F0A] text-white shadow-sm">
            PRO
          </span>
        ) : (
          <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200">
            FREE
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold text-ink leading-snug">
          {problem.title}
        </h3>
        <p className="mt-1.5 text-xs text-ink-muted leading-relaxed line-clamp-2">
          {problem.summary}
        </p>
      </div>
      <ul className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {problem.keyInsights.slice(0, 2).map((ins, i) => (
          <li
            key={i}
            className="text-[10px] text-ink-muted bg-ink/5 px-2 py-0.5 rounded-full line-clamp-1"
          >
            {ins.slice(0, 22)}
            {ins.length > 22 ? "…" : ""}
          </li>
        ))}
      </ul>
      {locked && (
        <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-xs font-semibold text-ink bg-white shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <LockIcon />
            Proで開放
          </div>
        </div>
      )}
    </Link>
  );
}

function EmptyShelf({ unit }: { unit: PhysUnit }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink-muted">
      {UNIT_LABEL[unit]} の問題は準備中です。
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm-2 4a2 2 0 114 0v2H8V6z" />
    </svg>
  );
}
