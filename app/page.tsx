import Link from "next/link";
import { Logo } from "@/components/Logo";
import { HeroFigure } from "@/components/HeroFigure";
import { getCurrentUser } from "@/lib/auth/user";

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
              理解ノートを開く
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                ログイン
              </Link>
              <a href="/api/auth/google/start" className="btn-primary">
                無料ではじめる
              </a>
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
              <span className="bg-gradient-to-r from-[#FF375F] via-[#FF9F0A] to-[#30D158] bg-clip-text text-transparent">
                矢印
              </span>
              でわかる。
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed">
              問題図を1枚アップすると、力・速度・加速度の矢印候補を図の上に重ねて表示。
              「正しい / 不要 / 向き違い」を自分で判定するだけで、
              <br className="hidden md:block" />
              なぜ間違えていたのかが見えるようになります。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  href="/upload"
                  className="btn-primary px-5 py-3 text-base"
                >
                  いますぐ解析する
                </Link>
              ) : (
                <a
                  href="/api/auth/google/start"
                  className="btn-primary px-5 py-3 text-base inline-flex items-center gap-2"
                >
                  <InlineGoogle />
                  Googleで無料ではじめる
                </a>
              )}
              <Link
                href="/pricing"
                className="btn-secondary px-5 py-3 text-base"
              >
                Proで何が開くか見る
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              クレカ不要。1 クリックでアカウント作成。
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

        <section className="mt-24">
          <div className="text-center mb-10">
            <div className="chip bg-white text-ink-muted border border-ink/10 mb-3">
              対応単元
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              力学の「詰まりやすい 5 単元」に特化
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              各単元ごとに誤解タグと立式テンプレを用意。サンプルはログイン不要で試せます。
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <UnitCard
              href="/demo/horizontal"
              title="水平面"
              hint="外力・摩擦・加速度"
              diagram={<MiniHorizontal />}
            />
            <UnitCard
              href="/demo/incline"
              title="斜面"
              hint="分解・垂直抗力"
              diagram={<MiniIncline />}
            />
            <UnitCard
              href="/demo/spring"
              title="ばね"
              hint="弾性力と変位"
              diagram={<MiniSpring />}
            />
            <UnitCard
              href="/demo/circular"
              title="円運動"
              hint="向心力・向心加速度"
              diagram={<MiniCircular />}
            />
            <UnitCard
              href="/demo/projectile"
              title="投射"
              hint="重力のみ・分解"
              diagram={<MiniProjectile />}
            />
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-2 gap-6 items-stretch">
          <div className="card p-6">
            <div className="chip bg-rose-50 text-rose-700 border border-rose-200 mb-3">
              普通の物理ソルバー
            </div>
            <ul className="space-y-3 text-sm text-ink-muted leading-relaxed">
              <CompareRow bad>問題図を食べると答えの数値だけ吐き出す</CompareRow>
              <CompareRow bad>どこで間違えたか本人に残らない</CompareRow>
              <CompareRow bad>「公式に代入」の暗記で終わる</CompareRow>
              <CompareRow bad>図の読み方は身につかない</CompareRow>
            </ul>
          </div>
          <div className="card p-6 bg-gradient-to-br from-[#FFF4F5] via-white to-[#F0FFF4] ring-1 ring-brand/10">
            <div className="chip bg-brand-light text-brand-dark mb-3">
              Arrow Physics
            </div>
            <ul className="space-y-3 text-sm text-ink leading-relaxed">
              <CompareRow good>矢印候補を図の上にリアルタイムで重ねる</CompareRow>
              <CompareRow good>誤解の種類をタグ化して履歴と苦手分析に残す</CompareRow>
              <CompareRow good>図 → 立式の橋渡し（運動方程式・向心力・エネルギー）</CompareRow>
              <CompareRow good>最後は自分で式を立てる設計。暗記に逃げない</CompareRow>
            </ul>
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-2 gap-6 items-stretch">
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

        <section className="mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-ink text-center">
            よくある質問
          </h2>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <Faq q="教科書や問題集の写真を解析できますか？">
              はい。PNG / JPEG / WEBP に対応しています。手書きの模式図でも読み取り可能です。斜めに撮れた写真でも図の方向を推定して矢印を重ねます。
            </Faq>
            <Faq q="必ず答えを出してくれますか？">
              いいえ、意図的に最終的な数値までは出しません。図と矢印が決まったあと「次に何を立てるか」だけを示します。式は自分で立てることが学習効果の核心だからです。
            </Faq>
            <Faq q="無料プランで何ができますか？">
              1 日 3 問まで解析可能、全単元の矢印判定と基本の誤解訂正、直近 10 件の履歴までが使えます。Pro でより多くの解析枠と詳細コメントが開きます。
            </Faq>
            <Faq q="スマホでも使えますか？">
              使えます。PC の方が快適ですが、矢印オーバーレイ UI はモバイルでも動作します。通学時間の復習に向きます。
            </Faq>
            <Faq q="指導者としての利用は？">
              補助教材として問題ありません。生徒に「なぜこの矢印は違うのか」を考えさせる教材として使えます。将来的に教師向け機能の追加を予定しています。
            </Faq>
            <Faq q="解析結果はどこに保存されますか？">
              あなたのアカウント内にのみ保存されます。他ユーザーからは見えません。履歴から過去の間違いを振り返って苦手傾向を分析できます。
            </Faq>
          </div>
        </section>

        <section className="mt-24 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0E1230] via-[#1E1746] to-[#0B0F24] px-6 py-14 sm:py-20 text-center">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(50% 80% at 50% 0%, rgba(255,55,95,0.25), transparent 60%), radial-gradient(50% 80% at 80% 100%, rgba(48,209,88,0.18), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#FF8AA4] via-[#FFD88A] to-[#8EF0BB] bg-clip-text text-transparent">
                図が怖くなくなるのは、今日からでいい。
              </span>
            </h2>
            <p className="mt-4 text-sm text-white/70 max-w-xl mx-auto">
              最初の 1 問はクレジットカード不要、30 秒で解析できます。
            </p>
            <div className="mt-7 flex justify-center gap-3 flex-wrap">
              {user ? (
                <Link
                  href="/upload"
                  className="inline-flex items-center rounded-full bg-white text-ink font-semibold px-6 py-3 hover:bg-white/90 transition"
                >
                  問題図をアップする
                </Link>
              ) : (
                <a
                  href="/api/auth/google/start"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-ink font-semibold px-6 py-3 hover:bg-white/90 transition"
                >
                  <InlineGoogle />
                  Googleで無料ではじめる
                </a>
              )}
              <Link
                href="/demo/incline"
                className="inline-flex items-center rounded-full bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 hover:bg-white/15 transition backdrop-blur-md"
              >
                デモを見る
              </Link>
            </div>
          </div>
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

function InlineGoogle() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
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

function UnitCard({
  href,
  title,
  hint,
  diagram,
}: {
  href: string;
  title: string;
  hint: string;
  diagram: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card p-4 flex flex-col gap-2 hover:shadow-lg hover:-translate-y-0.5 transition group"
    >
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[linear-gradient(180deg,#F7F8FB,#EDF1FF)] ring-1 ring-ink/5">
        {diagram}
      </div>
      <div>
        <div className="text-sm font-bold text-ink">{title}</div>
        <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div>
      </div>
      <div className="text-[11px] text-brand opacity-0 group-hover:opacity-100 transition">
        デモを開く →
      </div>
    </Link>
  );
}

function CompareRow({
  good,
  bad,
  children,
}: {
  good?: boolean;
  bad?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      {good && (
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" clipRule="evenodd" />
        </svg>
      )}
      {bad && (
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.7 5.3a1 1 0 010 1.4L11.4 10l3.3 3.3a1 1 0 01-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 01-1.4-1.4L8.6 10 5.3 6.7a1 1 0 011.4-1.4L10 8.6l3.3-3.3a1 1 0 011.4 0z" clipRule="evenodd" />
        </svg>
      )}
      <span>{children}</span>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="card p-5 group open:shadow-lg transition">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-sm font-semibold text-ink pr-4">{q}</span>
        <svg
          className="w-4 h-4 text-ink-muted transition group-open:rotate-180 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" clipRule="evenodd" />
        </svg>
      </summary>
      <p className="mt-3 text-sm text-ink-muted leading-relaxed">{children}</p>
    </details>
  );
}

// ---- Mini unit diagrams ---------------------------------------------------
// These are small, static previews shown on the LP "対応単元" section.
// Each fits inside a 4:3 box and communicates the core visual of that unit.

const MINI_RED = "#FF375F";
const MINI_GREEN = "#30D158";
const MINI_BLUE = "#3B5BFF";

// 3D helix projected to 2D: sin(t) skew shifts front vs back so consecutive
// coils cross visually — the correct "twisting spring" look instead of a flat
// zigzag or string-of-beads.
function miniSpringPath(
  x0: number,
  x1: number,
  cy: number,
  coils: number,
  r: number,
  samples: number = 160,
): string {
  const length = x1 - x0;
  const pitch = length / coils;
  const skew = pitch * 0.48;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const t = u * coils * 2 * Math.PI - Math.PI / 2;
    const x = x0 + u * length + (Math.sin(t) + 1) * skew;
    const y = cy - Math.cos(t) * r;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function MiniSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" className="w-full h-full">
      <defs>
        <marker
          id="miniHead"
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,1.4 L10,5 L0,8.6 z" fill={MINI_RED} />
        </marker>
        <marker
          id="miniHeadBlue"
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,1.4 L10,5 L0,8.6 z" fill={MINI_BLUE} />
        </marker>
        <marker
          id="miniHeadGreen"
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,1.4 L10,5 L0,8.6 z" fill={MINI_GREEN} />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

function MiniHorizontal() {
  return (
    <MiniSvg>
      <line x1="0" y1="90" x2="160" y2="90" stroke="#5865A0" strokeWidth="1.5" />
      <rect x="66" y="66" width="36" height="24" rx="3" fill="#0B1020" />
      <line x1="84" y1="78" x2="84" y2="94" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
      <line x1="84" y1="78" x2="84" y2="62" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
      <line x1="102" y1="78" x2="132" y2="78" stroke={MINI_BLUE} strokeWidth="2" markerEnd="url(#miniHeadBlue)" strokeLinecap="round" />
      <line x1="66" y1="78" x2="42" y2="78" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
    </MiniSvg>
  );
}

function MiniIncline() {
  return (
    <MiniSvg>
      <polygon points="20,95 140,95 140,40" fill="#E4E8F3" stroke="#5865A0" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="20" y1="95" x2="140" y2="40" stroke="rgba(255,255,255,0.9)" strokeWidth="1" />
      <g transform="translate(90.8,51.5) rotate(-24.6)">
        <rect x="-15" y="-10" width="30" height="20" rx="3" fill="#0B1020" />
      </g>
      <line x1="90.8" y1="51.5" x2="90.8" y2="78" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
      <line x1="90.8" y1="51.5" x2="79.8" y2="26.5" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
      <line x1="90.8" y1="51.5" x2="110.8" y2="42.5" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
    </MiniSvg>
  );
}

function MiniSpring() {
  return (
    <MiniSvg>
      <line x1="0" y1="100" x2="160" y2="100" stroke="#5865A0" strokeWidth="1.5" />
      <rect x="10" y="46" width="8" height="54" fill="#5865A0" />
      <path
        d={miniSpringPath(18, 95, 86, 7, 9)}
        stroke="#0B1020"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="95" y="72" width="36" height="28" rx="3" fill="#0B1020" />
      <line x1="95" y1="86" x2="71" y2="86" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
    </MiniSvg>
  );
}

function MiniCircular() {
  return (
    <MiniSvg>
      <circle cx="80" cy="60" r="40" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx="80" cy="60" r="3" fill="#5865A0" />
      <line x1="80" y1="60" x2="120" y2="60" stroke="#0B1020" strokeWidth="1.2" />
      <circle cx="120" cy="60" r="10" fill="#0B1020" />
      <line x1="120" y1="60" x2="94" y2="60" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
      <line x1="120" y1="60" x2="120" y2="30" stroke={MINI_BLUE} strokeWidth="2" markerEnd="url(#miniHeadBlue)" strokeLinecap="round" />
    </MiniSvg>
  );
}

function MiniProjectile() {
  return (
    <MiniSvg>
      <line x1="0" y1="100" x2="160" y2="100" stroke="#5865A0" strokeWidth="1.5" />
      <path d="M20 100 Q 80 10 140 100" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 4" fill="none" />
      <circle cx="20" cy="100" r="3" fill="#5865A0" />
      <line x1="20" y1="100" x2="44" y2="70" stroke={MINI_GREEN} strokeWidth="2" markerEnd="url(#miniHeadGreen)" strokeLinecap="round" />
      <circle cx="80" cy="30" r="8" fill="#0B1020" />
      <line x1="80" y1="30" x2="80" y2="58" stroke={MINI_RED} strokeWidth="2" markerEnd="url(#miniHead)" strokeLinecap="round" />
    </MiniSvg>
  );
}

