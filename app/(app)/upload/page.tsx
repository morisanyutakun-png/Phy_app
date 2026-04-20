import { UploadForm } from "@/components/UploadForm";
import { requireUser } from "@/lib/auth/user";
import { getUsageStatus } from "@/lib/limits";
import { SAMPLE_PROBLEMS } from "@/lib/samples";

export default async function UploadPage() {
  const user = await requireUser();
  const usage = await getUsageStatus(user.id);

  return (
    <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-ink">問題図をアップロード</h1>
        <p className="mt-1 text-sm text-ink-muted leading-relaxed">
          力学の問題図（斜面、摩擦、ばね、円運動、投射 など）をアップロードしてください。
          <br />
          PNG / JPEG / WEBP, 8MB まで。
        </p>

        <div className="mt-5">
          <UploadForm canAnalyze={usage.canAnalyze} plan={usage.plan} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-ink">
          まずはお試し問題から
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          代表的な力学の図を用意しています。クリックすると、その場でサンプル解析が開きます（無料枠を消費しません）。
        </p>
        <ul className="mt-4 space-y-2">
          {SAMPLE_PROBLEMS.map((s) => (
            <li key={s.id}>
              <a
                href={`/demo/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-white hover:bg-ink/5 px-3 py-2.5"
              >
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {s.title}
                  </div>
                  <div className="text-xs text-ink-muted">{s.summary}</div>
                </div>
                <span className="text-xs text-brand">試す →</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
