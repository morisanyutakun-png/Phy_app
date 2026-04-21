import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getProblem, PROBLEMS, UNIT_LABEL } from "@/lib/problems";
import { ProblemRunner } from "@/components/simulation/ProblemRunner";

export function generateStaticParams() {
  return PROBLEMS.map((p) => ({ slug: p.slug }));
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  const user = await requireUser();
  if (problem.tier === "PRO" && user.plan !== "PRO") {
    redirect(`/pricing?reason=locked&slug=${slug}`);
  }

  return (
    <div className="space-y-6">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-ink-muted">
        <Link href="/library" className="hover:text-ink">ライブラリ</Link>
        <span>›</span>
        <span>{UNIT_LABEL[problem.unit]}</span>
        <span>›</span>
        <span className="text-ink">{problem.title}</span>
      </nav>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="chip bg-brand-light text-brand-dark">
            {UNIT_LABEL[problem.unit]}
          </span>
          <span className="chip bg-ink/5 text-ink-muted">{problem.level}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          {problem.title}
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">{problem.summary}</p>
      </header>

      {/* Main: simulation + controls */}
      <ProblemRunner problem={problem} />

      {/* Key insights */}
      <section className="card p-6">
        <h2 className="text-base font-bold text-ink mb-3">ポイント</h2>
        <ul className="space-y-2.5">
          {problem.keyInsights.map((k, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm text-ink leading-relaxed"
            >
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </span>
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Formulas */}
      {problem.formulas.length > 0 && (
        <section className="card p-6">
          <h2 className="text-base font-bold text-ink mb-3">立式</h2>
          <div className="space-y-3">
            {problem.formulas.map((f, i) => (
              <div key={i} className="rounded-xl border border-ink/10 p-4">
                <div className="text-sm font-semibold text-ink">{f.title}</div>
                <pre className="mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink overflow-x-auto font-mono">
                  {f.expr}
                </pre>
                {f.note && (
                  <p className="mt-1.5 text-xs text-ink-muted">{f.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Misconceptions */}
      {problem.misconceptions.length > 0 && (
        <section className="card p-6">
          <h2 className="text-base font-bold text-ink mb-3">よくある誤解</h2>
          <div className="space-y-2.5">
            {problem.misconceptions.map((m) => (
              <div
                key={m.tag}
                className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5"
              >
                <div className="text-sm font-semibold text-amber-900">
                  {m.label}
                </div>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                  {m.short}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related problems */}
      <RelatedProblems currentSlug={problem.slug} unit={problem.unit} isPro={user.plan === "PRO"} />
    </div>
  );
}

function RelatedProblems({
  currentSlug,
  unit,
  isPro,
}: {
  currentSlug: string;
  unit: string;
  isPro: boolean;
}) {
  const related = PROBLEMS.filter(
    (p) => p.unit === unit && p.slug !== currentSlug
  );
  if (related.length === 0) return null;
  return (
    <section>
      <h2 className="text-base font-bold text-ink mb-3">同じ単元の他の問題</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {related.map((p) => {
          const locked = p.tier === "PRO" && !isPro;
          return (
            <Link
              key={p.slug}
              href={locked ? "/pricing" : `/library/${p.slug}`}
              className="card p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-ink-muted">{p.level}</span>
                {p.tier === "PRO" && (
                  <span className="chip bg-gradient-to-r from-[#FF375F] to-[#FF9F0A] text-white text-[9px]">PRO</span>
                )}
              </div>
              <div className="text-sm font-semibold text-ink">{p.title}</div>
              <div className="text-xs text-ink-muted mt-1 line-clamp-2">{p.summary}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
