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

  // Apple Music-inspired vivid accents that pop against a dark canvas.
  const red = "#FF375F";
  const green = "#30D158";
  const amber = "#FF9F0A";
  const stroke = 2.4;

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
    <div className="relative">
      {/* Ambient colored halos behind the card — slow breath */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(40% 60% at 15% 20%, rgba(255,55,95,0.38), transparent 60%), radial-gradient(40% 60% at 85% 80%, rgba(48,209,88,0.26), transparent 60%), radial-gradient(40% 60% at 80% 20%, rgba(255,159,10,0.24), transparent 60%)",
          animation: "heroHaloBreath 6s ease-in-out infinite",
        }}
      />
      <div
        className="relative aspect-[500/340] rounded-[28px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(11,16,40,0.55),0_6px_14px_-6px_rgba(11,16,40,0.4)]"
        style={{
          background:
            "radial-gradient(120% 90% at 0% 0%, #1E1746 0%, #0E1230 45%, #07081B 100%)",
        }}
      >
        {/* Subtle noise/grain for depth */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />

        {/* Soft radial focus behind the block */}
        <div
          aria-hidden
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: "36%",
            height: "48%",
            left: `${(block.cx / vbW) * 100}%`,
            top: `${(block.cy / vbH) * 100}%`,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,55,95,0.28) 0%, rgba(255,159,10,0.18) 35%, transparent 70%)",
          }}
        />

        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="relative z-10 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="heroSlope" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
            </linearGradient>
            <linearGradient id="heroSlopeEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
            </linearGradient>
            <linearGradient id="heroBlock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A2560" />
              <stop offset="50%" stopColor="#14183B" />
              <stop offset="100%" stopColor="#0A0B1F" />
            </linearGradient>
            <linearGradient id="heroBlockTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <pattern
              id="heroHatch"
              patternUnits="userSpaceOnUse"
              width="11"
              height="11"
              patternTransform="rotate(45)"
            >
              <rect width="11" height="11" fill="transparent" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="11"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1"
              />
            </pattern>
            <filter id="heroBlockShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="6"
                floodColor="#000"
                floodOpacity="0.55"
              />
            </filter>
            <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
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
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,1.4 L10,5 L0,8.6 z" fill={m.color} />
              </marker>
            ))}
          </defs>

          {/* Ground hatching */}
          <rect x="0" y="300" width={vbW} height="40" fill="url(#heroHatch)" />
          <line
            x1="0"
            y1="300"
            x2={vbW}
            y2="300"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />

          {/* Slope */}
          <polygon
            points={`${slopeL.x},${slopeL.y} ${slopeR.x},${slopeL.y} ${slopeR.x},${slopeR.y}`}
            fill="url(#heroSlope)"
            stroke="url(#heroSlopeEdge)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* highlight along the slope top edge */}
          <line
            x1={slopeL.x}
            y1={slopeL.y}
            x2={slopeR.x}
            y2={slopeR.y}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Angle θ arc */}
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
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="1"
                />
                <text
                  x={slopeL.x + r * 0.62 * Math.cos(rad / 2)}
                  y={slopeL.y - r * 0.62 * Math.sin(rad / 2) + 5}
                  fontSize="17"
                  fill="rgba(255,255,255,0.75)"
                  fontStyle="italic"
                  fontWeight={500}
                  textAnchor="middle"
                  fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif"
                >
                  θ
                </text>
              </>
            );
          })()}

          {/* Trajectory — neon green dashed, marching down-slope forever */}
          <line
            x1={block.cx + down.x * 46}
            y1={block.cy + down.y * 46}
            x2={block.cx + down.x * 180}
            y2={block.cy + down.y * 180}
            stroke={green}
            strokeOpacity="0.45"
            strokeWidth="1.6"
            strokeDasharray="3 5"
            strokeLinecap="round"
            filter="url(#heroGlow)"
            style={{
              animation: "heroDashMarch 1.2s linear infinite",
            }}
          />

          {/* Block — very subtle vertical bob */}
          <g
            transform={`translate(${block.cx} ${block.cy}) rotate(${-angleDeg})`}
            filter="url(#heroBlockShadow)"
            style={{
              transformOrigin: `${block.cx}px ${block.cy}px`,
              animation: "heroBlockBreath 4s ease-in-out infinite",
            }}
          >
            <rect
              x={-30}
              y={-22}
              width={60}
              height={44}
              rx={7}
              fill="url(#heroBlock)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.6"
            />
            {/* glossy top sheen */}
            <rect
              x={-28}
              y={-20}
              width={56}
              height={16}
              rx={5}
              fill="url(#heroBlockTop)"
              opacity={0.6}
            />
            <text
              x={0}
              y={6}
              fill="rgba(255,255,255,0.92)"
              fontSize={18}
              fontWeight={600}
              textAnchor="middle"
              fontStyle="italic"
              fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif"
            >
              m
            </text>
          </g>

          {/* Origin halo — pulses outward every 2s */}
          <circle
            cx={block.cx}
            cy={block.cy}
            r="5"
            fill={red}
            style={{
              opacity: 0.35,
              animation: "heroOriginPulse 2s cubic-bezier(0.22,1,0.36,1) infinite",
            }}
          />
          <circle cx={block.cx} cy={block.cy} r="5" fill={red} opacity="0.18" />
          <circle cx={block.cx} cy={block.cy} r="2.6" fill="rgba(255,255,255,0.95)" />

          {/* Arrows (neon, glowing) */}
          {arrowsWithGeom.map((a) => {
            const marker =
              a.color === red
                ? "url(#heroMr)"
                : a.color === green
                  ? "url(#heroMg)"
                  : "url(#heroMa)";
            const L = Math.hypot(a.x2 - a.x1, a.y2 - a.y1);
            return (
              <g key={a.id} filter="url(#heroGlow)">
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
                    animation: `heroDraw 0.8s ${0.2 + a.order * 0.16}s cubic-bezier(0.22,1,0.36,1) forwards`,
                  }}
                />
                {a.kind === "kinematic" && (
                  <circle
                    cx={a.x1}
                    cy={a.y1}
                    r={2.4}
                    fill={a.color}
                    style={{
                      opacity: 0,
                      animation: `heroFadeIn 0.3s ${0.2 + a.order * 0.16 + 0.4}s ease-out forwards`,
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* AI scan sweep — thin vertical band that crosses the figure every 5s */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20"
          style={{
            width: "14%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.35) 55%, transparent 100%)",
            mixBlendMode: "overlay",
            filter: "blur(1px)",
            animation: "heroScanSweep 5s cubic-bezier(0.65,0,0.35,1) infinite",
            animationDelay: "1.5s",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20"
          style={{
            width: "2px",
            background:
              "linear-gradient(180deg, transparent, rgba(48,209,88,0.9), transparent)",
            boxShadow: "0 0 12px rgba(48,209,88,0.6)",
            animation: "heroScanSweep 5s cubic-bezier(0.65,0,0.35,1) infinite",
            animationDelay: "1.5s",
          }}
        />

        {/* HTML labels — glass pills Apple-style */}
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

        {/* Live analysis badge — glass */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-[0_4px_14px_rgba(0,0,0,0.25)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/90">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
              style={{ background: green }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: green, boxShadow: `0 0 8px ${green}` }}
            />
          </span>
          リアルタイム解析
        </div>

        {/* Legend — glass */}
        <div className="absolute right-3 bottom-3 flex items-center gap-3 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/80">
          <LegendSwatch color={red} label="力" />
          <LegendSwatch color={green} label="速度" />
          <LegendSwatch color={amber} label="加速度" />
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted leading-relaxed text-center">
        リアルタイム解析のサンプル — 粗い斜面上の運動（FBD + 運動ベクトル）
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
      className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-medium tracking-wide bg-white/[0.08] backdrop-blur-md border border-white/15 text-white/95 shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        opacity: 0,
        animation: `heroLabelIn 0.45s ${0.25 + order * 0.16 + 0.55}s cubic-bezier(0.22,1,0.36,1) forwards`,
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: 6,
          height: 6,
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 2px ${color}`,
        }}
      />
      {label}
    </span>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block rounded-full"
        style={{
          width: 6,
          height: 6,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      {label}
    </span>
  );
}
