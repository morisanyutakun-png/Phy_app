import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/user";
import { UpgradeButton, ManagePlanButton } from "@/components/PlanButtons";
import { FREE_DAILY_LIMIT, PRO_DAILY_LIMIT } from "@/lib/limits";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const plan = user?.plan ?? "FREE";
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-ink">料金プラン</h1>
        <p className="mt-2 text-sm text-ink-muted">
          無料プランでも矢印判定・誤解訂正は使えます。継続して伸ばしたい人向けに Pro を用意しています。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <div className="card p-6 flex flex-col">
          <div className="text-sm font-semibold text-ink-muted">Free</div>
          <div className="mt-1 text-3xl font-bold text-ink">¥0</div>
          <p className="mt-1 text-xs text-ink-muted">まず試したい人向け</p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink">
            <Feature>1 日 {FREE_DAILY_LIMIT} 問まで解析</Feature>
            <Feature>力・速度・加速度の矢印候補表示</Feature>
            <Feature>正しい / 不要 / 向き違いの判定</Feature>
            <Feature>基本の誤解訂正コメント</Feature>
            <Feature>直近 10 件の履歴</Feature>
          </ul>
          <div className="mt-auto pt-6">
            {!user ? (
              <Link href="/register" className="btn-secondary w-full">
                無料で登録する
              </Link>
            ) : plan === "FREE" ? (
              <div className="text-xs text-ink-muted text-center">
                現在のプラン
              </div>
            ) : null}
          </div>
        </div>

        <div className="card p-6 flex flex-col border-2 border-brand">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-brand">Pro</div>
            <span className="chip bg-brand-light text-brand-dark">
              継続勉強向き
            </span>
          </div>
          <div className="mt-1 text-3xl font-bold text-ink">
            ¥980 <span className="text-sm font-medium text-ink-muted">/ 月</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">学生が続けられる価格感</p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink">
            <Feature>1 日 {PRO_DAILY_LIMIT} 問まで解析（実質無制限）</Feature>
            <Feature>力学 5 単元すべて（水平・斜面・ばね・円運動・投射）</Feature>
            <Feature>詳細な誤解訂正コメント</Feature>
            <Feature>苦手傾向の集計とおすすめ単元</Feature>
            <Feature>履歴をすべて保存・検索</Feature>
            <Feature>立式サポートの拡張（今後追加予定）</Feature>
          </ul>
          <div className="mt-auto pt-6">
            {!user ? (
              <Link href="/register" className="btn-primary w-full">
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

      <div className="text-center text-xs text-ink-muted max-w-xl mx-auto leading-relaxed">
        ※ 価格・上限は変更される場合があります。将来的に教師向け機能・類題提案なども Pro 側で提供予定です。
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600"
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
