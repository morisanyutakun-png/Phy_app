import { AnalysisView } from "@/components/AnalysisView";
import { Logo } from "@/components/Logo";
import { getSample, SAMPLE_PROBLEMS } from "@/lib/samples";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SAMPLE_PROBLEMS.map((s) => ({ sampleId: s.id }));
}

export default function DemoPage({ params }: { params: { sampleId: string } }) {
  const sample = getSample(params.sampleId);
  if (!sample) notFound();

  return (
    <div className="min-h-dvh bg-[#F7F8FB]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-ink/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="chip bg-amber-100 text-amber-900">デモモード</span>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-sm">
              トップへ
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              無料で登録して自分の問題図を試す
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-ink">{sample.title}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {sample.summary} — 矢印を1つずつ「正しい / 不要 / 向き違い」で判定してみましょう。
          </p>
        </div>
        <AnalysisView
          analysisId="demo"
          imageUrl={sample.imageUrl}
          result={sample.result}
        />
        <div className="mt-6 text-center">
          <Link href="/register" className="btn-primary px-5 py-3">
            自分の問題図で試す（無料登録）
          </Link>
        </div>
      </main>
    </div>
  );
}
