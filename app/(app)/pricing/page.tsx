import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/user";
import { UpgradeButton, ManagePlanButton } from "@/components/PlanButtons";
import { PROBLEMS } from "@/lib/problems";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const plan = user?.plan ?? "FREE";

  const freeCount = PROBLEMS.filter((p) => p.tier === "FREE").length;
  const proOnly = PROBLEMS.filter((p) => p.tier === "PRO").length;
  const total = PROBLEMS.length;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="chip bg-brand-light text-brand-dark border border-brand/10 mb-3">
          料金プラン
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-ink tracking-tight">
          定番問題を、アニメーションで体に入れる。
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          FREE でも代表問題 {freeCount} 問が無料で触れます。Pro で
          <strong className="text-ink"> {total} 問すべて + 詳細解説 + 自分の問題アップロード解析</strong>が開放されます。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <div className="card p-7 flex flex-col">
          <div className="text-sm font-semibold text-ink-muted">Free</div>
          <div className="mt-1 text-4xl font-bold text-ink">¥0</div>
          <p className="mt-1 text-xs text-ink-muted">まず触ってみる人向け</p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink">
            <Feature>ライブラリ {freeCount} 問（各単元の代表問題）</Feature>
            <Feature>アニメーションと矢印オーバーレイ</Feature>
            <Feature>パラメータを変えながら学習</Feature>
            <Feature>立式ヒントと誤解訂正カード</Feature>
            <Feature>1 日 3 問まで自分の問題をアップロード解析</Feature>
          </ul>
          <div className="mt-auto pt-6">
            {!user ? (
              <Link href="/login" className="btn-secondary w-full">
                Googleで登録
              </Link>
            ) : plan === "FREE" ? (
              <div className="text-xs text-ink-muted text-center">現在のプラン</div>
            ) : null}
          </div>
        </div>

        <div className="card p-7 flex flex-col border-2 border-brand relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(255,55,95,0.35), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-brand">Pro</div>
              <span className="chip bg-gradient-to-r from-[#FF375F] to-[#FF9F0A] text-white">
                ぜんぶ開放
              </span>
            </div>
            <div className="mt-1 text-4xl font-bold text-ink">
              ¥980 <span className="text-sm font-medium text-ink-muted">/ 月</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              学生が続けられる価格感（スタバ 1 杯 + α）
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink">
              <Feature highlight>
                ライブラリ全 {total} 問（Pro 限定の発展問題 {proOnly} 問を追加）
              </Feature>
              <Feature highlight>すべての単元の派生パターン（鉛直ばね、崖から投射 など）</Feature>
              <Feature>苦手傾向の集計と週次レポート</Feature>
              <Feature>履歴を全件保存・検索</Feature>
              <Feature>自分の問題アップロード解析（1 日 200 回まで）</Feature>
              <Feature>立式の詳細ステップ（Pro 限定）</Feature>
              <Feature>今後: 類題提案 / 印刷用 PDF / 教師モード</Feature>
            </ul>
            <div className="mt-7">
              {!user ? (
                <Link href="/login" className="btn-primary w-full">
                  登録して Pro にする
                </Link>
              ) : plan === "PRO" ? (
                <ManagePlanButton />
              ) : (
                <UpgradeButton />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-ink text-center mb-4">
          Pro で何が変わるか
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ValueCard
            title="派生パターンの理解"
            body="鉛直ばね、崖からの投射、斜面と摩擦のからみ — 入試で差がつく応用問題が解けるようになる。"
          />
          <ValueCard
            title="手を動かしながら気づく"
            body="角度・質量・摩擦を連続的に変えると、矢印が実時間で追従。『どう変わるか』が体感として入る。"
          />
          <ValueCard
            title="苦手の言語化"
            body="どの誤解タグで何回詰まったかを週次で集計。次に解くべき問題が勝手に浮かび上がる。"
          />
        </div>
      </div>

      <div className="text-center text-xs text-ink-muted max-w-xl mx-auto leading-relaxed pt-4">
        ※ 価格・問題数は変わる可能性があります。将来的に「教師向けクラス共有」「類題の自動推薦」なども Pro に載せていく予定です。
      </div>
    </div>
  );
}

function Feature({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${highlight ? "font-semibold" : ""}`}>
      <svg
        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${highlight ? "text-brand" : "text-emerald-600"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mt-2 text-xs text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}
