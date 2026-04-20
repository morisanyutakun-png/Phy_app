import Link from "next/link";
import { Logo } from "@/components/Logo";
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

// Scene geometry (single source of truth for HeroFigure).
// viewBox 500 x 340. Slope rises from (40, 300) to (460, 150) — angle ≈ 19.65°.
const HERO = (() => {
  const vbW = 500;
  const vbH = 340;
  const slopeL = { x: 40, y: 300 };
  const slopeR = { x: 460, y: 150 };
  const dx = slopeR.x - slopeL.x;
  const dy = slopeR.y - slopeL.y;
  const len = Math.hypot(dx, dy);
  const up = { x: dx / len, y: dy / len }; // up-slope unit (x pos, y neg)
  const down = { x: -up.x, y: -up.y }; // down-slope unit
  // Outward normal (into the air above the slope) = rotate up-slope 90° CW in screen coords.
  const nrm = { x: up.y, y: -up.x }; // (-0.336, -0.942): up and left
  // Block anchor: take a point along the slope, then lift by (block height / 2)
  // along the outward normal so the block sits flush.
  const blockHalfH = 22;
  const slopePt = { x: 312, y: 300 - ((312 - slopeL.x) / dx) * -dy }; // exact y on the slope
  const block = {
    cx: slopePt.x + nrm.x * blockHalfH,
    cy: slopePt.y + nrm.y * blockHalfH,
  };
  const angleDeg = (Math.atan2(-dy, dx) * 180) / Math.PI; // slope angle from horizontal
  return { vbW, vbH, slopeL, slopeR, up, down, nrm, block, angleDeg };
})();

type ArrowKind = "force" | "kinematic";

interface HeroArrow {
  id: string;
  color: string;
  kind: ArrowKind;
  /** Starting point in viewBox coords. For forces this is the block center;
   *  for kinematic vectors we deliberately place it OFF the block. */
  x1: number;
  y1: number;
  /** Unit direction */
  dir: { x: number; y: number };
  /** Length in viewBox units */
  len: number;
  /** Label shown as an HTML pill near the tip */
  label: string;
  /** Side (perpendicular to direction) to push the label toward. +1 = right of direction, -1 = left */
  labelSide?: 1 | -1;
  /** Extra along-direction offset past the tip */
  labelOver?: number;
  /** Extra perpendicular offset for the label (viewBox units) */
  labelPerp?: number;
  /** Animation order (0-based) */
  order: number;
}

function HeroFigure() {
  const { vbW, vbH, slopeL, slopeR, up, down, nrm, block, angleDeg } = HERO;

  const red = "#E0375C";
  const green = "#22B07D";
  const amber = "#F4A72B";
  const stroke = 2.6;

  // Kinematic callout anchor: 95 units down-slope from the block.
  // This keeps v/a visually detached from the block — their tails are NOT
  // at the center of mass, matching real FBD conventions where velocity
  // and acceleration are drawn as free kinematic vectors rather than forces.
  const kinAnchor = {
    x: block.cx + down.x * 100,
    y: block.cy + down.y * 100,
  };
  // Perpendicular outward shift so v and a sit slightly above the slope line,
  // not buried inside the slope fill.
  const kinShift = { x: nrm.x * 6, y: nrm.y * 6 };

  const arrows: HeroArrow[] = [
    // --- Forces: tails at block center (FBD convention) ---
    {
      id: "g",
      kind: "force",
      color: red,
      x1: block.cx,
      y1: block.cy,
      dir: { x: 0, y: 1 },
      len: 86,
      label: "重力 mg",
      labelSide: 1,
      order: 0,
    },
    {
      id: "N",
      kind: "force",
      color: red,
      x1: block.cx,
      y1: block.cy,
      dir: nrm,
      len: 84,
      label: "垂直抗力 N",
      labelSide: -1,
      order: 1,
    },
    {
      id: "f",
      kind: "force",
      color: red,
      x1: block.cx,
      y1: block.cy,
      dir: up,
      len: 66,
      label: "摩擦力 f",
      labelSide: -1,
      order: 2,
    },
    // --- Kinematic vectors: tails OFFSET from the block, not on it ---
    {
      id: "v",
      kind: "kinematic",
      color: green,
      x1: kinAnchor.x + kinShift.x,
      y1: kinAnchor.y + kinShift.y,
      dir: down,
      len: 54,
      label: "速度 v",
      labelSide: 1,
      labelOver: 12,
      labelPerp: 10,
      order: 3,
    },
    {
      id: "a",
      kind: "kinematic",
      color: amber,
      x1: kinAnchor.x - kinShift.x + down.x * 8,
      y1: kinAnchor.y - kinShift.y + down.y * 8,
      dir: down,
      len: 36,
      label: "加速度 a",
      labelSide: -1,
      labelOver: 10,
      labelPerp: 12,
      order: 4,
    },
  ];

  // For the draw-in animation each arrow is rendered with
  // stroke-dasharray / stroke-dashoffset = length.
  const arrowsWithGeom = arrows.map((a) => ({
    ...a,
    x2: a.x1 + a.dir.x * a.len,
    y2: a.y1 + a.dir.y * a.len,
  }));

  return (
    <div className="card p-4 sm:p-5">
      <div className="relative aspect-[500/340] rounded-xl overflow-hidden bg-white ring-1 ring-ink/5">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="heroSlope" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1F4FC" />
              <stop offset="100%" stopColor="#D4DAEB" />
            </linearGradient>
            <linearGradient id="heroBlock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#242B4E" />
              <stop offset="100%" stopColor="#0B1020" />
            </linearGradient>
            <pattern
              id="heroHatch"
              patternUnits="userSpaceOnUse"
              width="9"
              height="9"
              patternTransform="rotate(45)"
            >
              <rect width="9" height="9" fill="#F7F8FB" />
              <line x1="0" y1="0" x2="0" y2="9" stroke="#B9C0D4" strokeWidth="1.2" />
            </pattern>
            <filter id="heroBlockShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0B1020" floodOpacity="0.18" />
            </filter>
            {[
              { id: "heroMr", color: red },
              { id: "heroMg", color: green },
              { id: "heroMa", color: amber },
            ].map((m) => (
              <marker
                key={m.id}
                id={m.id}
                viewBox="0 0 10 10"
                refX="8.5"
                refY="5"
                markerWidth="7.5"
                markerHeight="7.5"
                orient="auto-start-reverse"
              >
                <path d="M0,1.2 L10,5 L0,8.8 z" fill={m.color} />
              </marker>
            ))}
          </defs>

          {/* ground baseline + hatching */}
          <rect x="0" y="300" width={vbW} height="40" fill="url(#heroHatch)" />
          <line
            x1="0"
            y1="300"
            x2={vbW}
            y2="300"
            stroke="#5865A0"
            strokeWidth="1"
          />

          {/* slope body */}
          <polygon
            points={`${slopeL.x},${slopeL.y} ${slopeR.x},${slopeL.y} ${slopeR.x},${slopeR.y}`}
            fill="url(#heroSlope)"
            stroke="#5865A0"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* angle θ */}
          {(() => {
            const rad = (angleDeg * Math.PI) / 180;
            const r = 74;
            const arcEndX = slopeL.x + r * Math.cos(rad);
            const arcEndY = slopeL.y - r * Math.sin(rad);
            return (
              <>
                <path
                  d={`M ${slopeL.x + r} ${slopeL.y} A ${r} ${r} 0 0 0 ${arcEndX} ${arcEndY}`}
                  fill="none"
                  stroke="#5865A0"
                  strokeWidth="1.2"
                />
                <text
                  x={slopeL.x + r * 0.62 * Math.cos(rad / 2)}
                  y={slopeL.y - r * 0.62 * Math.sin(rad / 2) + 5}
                  fontSize="17"
                  fill="#5865A0"
                  fontStyle="italic"
                  fontWeight={600}
                  textAnchor="middle"
                  fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif"
                >
                  θ
                </text>
              </>
            );
          })()}

          {/* kinematic guide: thin ghost track showing where the block will travel */}
          <line
            x1={block.cx + down.x * 44}
            y1={block.cy + down.y * 44}
            x2={block.cx + down.x * 170}
            y2={block.cy + down.y * 170}
            stroke="#22B07D"
            strokeOpacity="0.25"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* block — sits flush on the slope, with drop shadow */}
          <g
            transform={`translate(${block.cx} ${block.cy}) rotate(${-angleDeg})`}
            filter="url(#heroBlockShadow)"
          >
            <rect
              x={-30}
              y={-22}
              width={60}
              height={44}
              rx={5}
              fill="url(#heroBlock)"
            />
            {/* subtle top highlight */}
            <rect
              x={-28}
              y={-20}
              width={56}
              height={6}
              rx={3}
              fill="white"
              opacity={0.08}
            />
            <text
              x={0}
              y={6}
              fill="white"
              fontSize={17}
              fontWeight={700}
              textAnchor="middle"
              fontStyle="italic"
              fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif"
            >
              m
            </text>
          </g>

          {/* origin dot for the force FBD */}
          <circle cx={block.cx} cy={block.cy} r={2.8} fill="#0B1020" />

          {/* arrows — drawn AFTER everything so they sit on top */}
          {arrowsWithGeom.map((a) => {
            const marker =
              a.color === red
                ? "url(#heroMr)"
                : a.color === green
                  ? "url(#heroMg)"
                  : "url(#heroMa)";
            const L = Math.hypot(a.x2 - a.x1, a.y2 - a.y1);
            return (
              <g key={a.id}>
                <line
                  x1={a.x1}
                  y1={a.y1}
                  x2={a.x2}
                  y2={a.y2}
                  stroke={a.color}
                  strokeWidth={stroke}
                  markerEnd={marker}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: L,
                    strokeDashoffset: L,
                    animation: `heroDraw 0.7s ${0.2 + a.order * 0.14}s cubic-bezier(0.22,0.61,0.36,1) forwards`,
                  }}
                />
                {/* tiny dot at the tail for kinematic vectors, to emphasize
                    they DO NOT originate at the block */}
                {a.kind === "kinematic" && (
                  <circle
                    cx={a.x1}
                    cy={a.y1}
                    r={2.2}
                    fill={a.color}
                    style={{
                      opacity: 0,
                      animation: `heroFadeIn 0.3s ${0.2 + a.order * 0.14 + 0.35}s ease-out forwards`,
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* HTML labels — pinned to the tip in % so they stay crisp */}
        {arrowsWithGeom.map((a) => {
          const perp = { x: -a.dir.y, y: a.dir.x };
          const side = a.labelSide ?? 1;
          const over = a.labelOver ?? 14;
          const perpAmt = a.labelPerp ?? 14;
          const lx = a.x2 + a.dir.x * over + perp.x * perpAmt * side;
          const ly = a.y2 + a.dir.y * over + perp.y * perpAmt * side;
          return (
            <HeroLabel
              key={a.id}
              x={lx / vbW}
              y={ly / vbH}
              color={a.color}
              label={a.label}
              order={a.order}
            />
          );
        })}

        {/* "Live analysis" badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 border border-ink/10 shadow-sm px-2.5 py-1 text-[11px] font-semibold text-ink">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          リアルタイム解析
        </div>

        {/* legend bottom-right */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2 text-[10px] font-medium text-ink-muted bg-white/85 rounded-md px-2 py-1 border border-ink/10">
          <LegendSwatch color={red} label="力" />
          <LegendSwatch color={green} label="速度" />
          <LegendSwatch color={amber} label="加速度" />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted leading-relaxed">
        サンプル：粗い斜面上の運動。<span style={{ color: "#E0375C" }}>力</span>・
        <span style={{ color: "#22B07D" }}>速度</span>・
        <span style={{ color: "#F4A72B" }}>加速度</span>を色分けして図に重ねます。
      </p>
    </div>
  );
}

function HeroLabel({
  x,
  y,
  color,
  label,
  order,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
  order: number;
}) {
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border bg-white/95 px-2 py-0.5 text-[11px] sm:text-xs font-semibold shadow-sm"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        color,
        borderColor: color,
        opacity: 0,
        animation: `heroLabelIn 0.35s ${0.2 + order * 0.14 + 0.55}s ease-out forwards`,
      }}
    >
      {label}
    </span>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block rounded-full"
        style={{ width: 7, height: 7, background: color }}
      />
      {label}
    </span>
  );
}
