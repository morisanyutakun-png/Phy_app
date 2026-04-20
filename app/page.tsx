import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth/user";
import { ARROW_COLORS as ARROW_TYPE_COLORS } from "@/lib/arrow-colors";

export default async function Landing() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#F7F8FB_0%,#EDF1FF_100%)]">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-5 pt-6">
        <Logo size="md" />
        <nav className="flex items-center gap-2">
          <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">
            料金
          </Link>
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              ダッシュボード
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                ログイン
              </Link>
              <Link href="/register" className="btn-primary">
                無料ではじめる
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-5 pt-16 pb-20">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="chip bg-white text-brand-dark border border-brand/20 mb-5">
              高校物理 × 力学 × 図解訂正
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight leading-tight">
              図で止まる物理を、
              <br />
              <span className="text-brand">矢印</span>でわかる。
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed">
              問題図を1枚アップすると、力・速度・加速度の矢印候補を図の上に重ねて表示。
              「正しい / 不要 / 向き違い」を自分で判定するだけで、
              <br className="hidden md:block" />
              なぜ間違えていたのかが見えるようになります。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={user ? "/upload" : "/register"}
                className="btn-primary px-5 py-3 text-base"
              >
                {user ? "いますぐ解析する" : "無料で試す（1日3問）"}
              </Link>
              <Link
                href="/pricing"
                className="btn-secondary px-5 py-3 text-base"
              >
                Proで何が開くか見る
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              クレカ不要ではじめられます。
            </p>
          </div>

          <HeroFigure />
        </section>

        <section className="mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-ink text-center">
            3ステップで「図が読める」感覚を作る
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            <Step
              n="1"
              title="問題図をアップ"
              body="教科書の図でも、自分で撮った問題集の写真でもOK。PNG / JPEG に対応。"
            />
            <Step
              n="2"
              title="矢印候補が重なる"
              body="力・速度・加速度を色分けして、図の上に候補を描き出します。クリックで根拠も確認。"
            />
            <Step
              n="3"
              title="正誤を判定して学ぶ"
              body="「正しい / 不要 / 向き違い」を押すだけ。自分の誤解がその場で言語化されます。"
            />
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-2 gap-6 items-center">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-ink">
              なぜ、ただのソルバーではないのか
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted leading-relaxed">
              <li>
                <strong className="text-ink">答えだけ出しても、図は読めるようにならない。</strong>
                Arrow Physics は、矢印をあなた自身が確かめるプロセスに焦点を当てます。
              </li>
              <li>
                <strong className="text-ink">誤解の種類を可視化。</strong>
                「摩擦の向き」「向心加速度を外向きに描く」「速度と加速度の混同」など、典型的なつまずきを個別にラベル化して履歴に残します。
              </li>
              <li>
                <strong className="text-ink">式に橋渡し。</strong>
                図が決まったら、次に立てるべき式（運動方程式、向心力の式、エネルギー保存など）を短く提示します。
              </li>
            </ul>
          </div>
          <div className="card p-6 bg-gradient-to-br from-brand-light to-white">
            <h3 className="text-lg font-bold text-ink">
              こんな高校生に使ってほしい
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink leading-relaxed">
              <li>・ 公式は覚えたのに、図を見ると手が止まる</li>
              <li>・ 斜面・摩擦・円運動・投射・ばねで毎回迷う</li>
              <li>・ 解説を読むのはしんどい。でも「どこが違ったか」は知りたい</li>
              <li>・ 受験で物理を使う。直前期に誤解を潰したい</li>
            </ul>
            <p className="mt-5 text-xs text-ink-muted">
              指導者（塾講師・家庭教師・高校教員）の補助教材としても使えます。
            </p>
          </div>
        </section>

        <section className="mt-24 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            図が怖くなくなるのは、今日からでいい。
          </h2>
          <Link
            href={user ? "/upload" : "/register"}
            className="btn-primary mt-6 px-6 py-3 text-base"
          >
            {user ? "問題図をアップする" : "無料ではじめる"}
          </Link>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-5 py-10 text-xs text-ink-muted flex justify-between border-t border-ink/5">
        <div>© {new Date().getFullYear()} Arrow Physics</div>
        <div className="flex gap-4">
          <Link href="/pricing">料金</Link>
          <Link href="/login">ログイン</Link>
        </div>
      </footer>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-5">
      <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
        {n}
      </div>
      <h3 className="mt-3 text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function HeroFigure() {
  return (
    <div className="card p-5">
      <div className="aspect-[4/3] rounded-xl relative overflow-hidden bg-[repeating-linear-gradient(45deg,#F2F4FA,#F2F4FA_10px,#E8ECF7_10px,#E8ECF7_20px)]">
        <svg viewBox="0 0 100 75" className="absolute inset-0 w-full h-full">
          {/* incline */}
          <polygon points="10,65 90,65 90,25" fill="#D6DCEB" />
          <line
            x1="10"
            y1="65"
            x2="90"
            y2="25"
            stroke="#5865A0"
            strokeWidth="0.8"
          />
          {/* block */}
          <g transform="translate(55,40) rotate(-26.57)">
            <rect
              x="-7"
              y="-5"
              width="14"
              height="10"
              fill="#0B1020"
              rx="1.2"
            />
          </g>
          {/* gravity */}
          <Arrow
            color={ARROW_TYPE_COLORS.force}
            x1={55}
            y1={42}
            x2={55}
            y2={62}
            label="重力"
          />
          {/* normal */}
          <Arrow
            color={ARROW_TYPE_COLORS.force}
            x1={55}
            y1={42}
            x2={44}
            y2={36}
            label="垂直抗力"
          />
          {/* friction */}
          <Arrow
            color={ARROW_TYPE_COLORS.force}
            x1={55}
            y1={42}
            x2={46}
            y2={38}
            dash="1.5 1.5"
            label="摩擦力"
          />
          {/* velocity */}
          <Arrow
            color={ARROW_TYPE_COLORS.velocity}
            x1={55}
            y1={42}
            x2={71}
            y2={50}
            label="速度"
          />
          {/* accel */}
          <Arrow
            color={ARROW_TYPE_COLORS.acceleration}
            x1={55}
            y1={42}
            x2={67}
            y2={48}
            label="加速度"
          />
        </svg>
      </div>
      <div className="mt-3 text-xs text-ink-muted">
        サンプル：斜面上の運動。力 / 速度 / 加速度を色分けして重ねて表示します。
      </div>
    </div>
  );
}

function Arrow({
  color,
  x1,
  y1,
  x2,
  y2,
  dash,
  label,
}: {
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dash?: string;
  label: string;
}) {
  const id = `mk-${color.replace("#", "")}`;
  return (
    <g>
      <defs>
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="1.1"
        strokeDasharray={dash}
        markerEnd={`url(#${id})`}
        strokeLinecap="round"
      />
      <text
        x={(x1 + x2) / 2 + 1.5}
        y={(y1 + y2) / 2 - 1}
        fill={color}
        fontSize="2.6"
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}
