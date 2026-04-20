"use client";

import { useEffect, useState } from "react";

// ---- Scene geometry -------------------------------------------------------
const VB_W = 500;
const VB_H = 340;
const SLOPE_L = { x: 40, y: 300 };
const SLOPE_R = { x: 460, y: 150 };
const DX = SLOPE_R.x - SLOPE_L.x;
const DY = SLOPE_R.y - SLOPE_L.y;
const SLOPE_LEN = Math.hypot(DX, DY);
const UP = { x: DX / SLOPE_LEN, y: DY / SLOPE_LEN };
const DOWN = { x: -UP.x, y: -UP.y };
const NRM = { x: UP.y, y: -UP.x }; // outward normal (into the air above slope)
const ANGLE_DEG = (Math.atan2(-DY, DX) * 180) / Math.PI;
const BLOCK_HALF_H = 22;

// Slope-parameter range the block traverses (0 = bottom-left foot, 1 = top-right peak)
const START_S = 0.78;
const END_S = 0.38;

// ---- Animation timeline (ms) ---------------------------------------------
const FADE_IN = 450;
const SLIDE = 3200;
const FADE_OUT = 500;
const PAUSE = 800;
const CYCLE = FADE_IN + SLIDE + FADE_OUT + PAUSE;

// ---- Colors ---------------------------------------------------------------
const RED = "#FF375F";
const GREEN = "#30D158";
const AMBER = "#FF9F0A";

type Phase = "fadeIn" | "slide" | "fadeOut" | "pause";

interface Frame {
  phase: Phase;
  p: number; // slide progress 0..1
  opacity: number;
  block: { cx: number; cy: number };
  vLen: number;
  aLen: number;
}

function slopePoint(s: number) {
  return {
    x: SLOPE_L.x + DX * s,
    y: SLOPE_L.y + DY * s,
  };
}

function computeFrame(elapsedMs: number): Frame {
  const t = ((elapsedMs % CYCLE) + CYCLE) % CYCLE;

  let phase: Phase;
  let p = 0;
  let opacity = 1;

  if (t < FADE_IN) {
    phase = "fadeIn";
    opacity = t / FADE_IN;
    p = 0;
  } else if (t < FADE_IN + SLIDE) {
    phase = "slide";
    const raw = (t - FADE_IN) / SLIDE;
    // Constant acceleration: distance ∝ t², so progress along the slope is quadratic.
    p = raw * raw;
    opacity = 1;
  } else if (t < FADE_IN + SLIDE + FADE_OUT) {
    phase = "fadeOut";
    opacity = 1 - (t - FADE_IN - SLIDE) / FADE_OUT;
    p = 1;
  } else {
    phase = "pause";
    opacity = 0;
    p = 0;
  }

  const s = START_S + (END_S - START_S) * p;
  const sp = slopePoint(s);
  const block = {
    cx: sp.x + NRM.x * BLOCK_HALF_H,
    cy: sp.y + NRM.y * BLOCK_HALF_H,
  };
  // |v| = √(2 a d); here d ∝ p, so |v| ∝ √p. Map to a visual length in viewBox units.
  const vLen = 28 + 38 * Math.sqrt(p);
  // Acceleration is (roughly) constant for this demo
  const aLen = 34;

  return { phase, p, opacity, block, vLen, aLen };
}

interface ArrowSpec {
  id: string;
  kind: "force" | "kinematic";
  color: string;
  x1: number;
  y1: number;
  dir: { x: number; y: number };
  len: number;
  label: string;
  labelSide: 1 | -1;
  labelOver: number;
  labelPerp: number;
}

export function HeroFigure() {
  // Seed SSR/first render with the fadeIn-complete state so content appears
  // instantly on load rather than flashing in.
  const [frame, setFrame] = useState<Frame>(() => computeFrame(FADE_IN));

  useEffect(() => {
    let raf = 0;
    const start = performance.now() - FADE_IN;
    const loop = (now: number) => {
      setFrame(computeFrame(now - start));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { opacity, block, vLen, aLen } = frame;

  // Kinematic vectors are NOT emanating from the block — anchor them ~100 viewBox
  // units down-slope from the block, slightly offset above/below the trajectory so
  // v and a don't stack.
  const kinAnchor = {
    x: block.cx + DOWN.x * 100,
    y: block.cy + DOWN.y * 100,
  };
  const kinShift = { x: NRM.x * 6, y: NRM.y * 6 };

  const arrows: ArrowSpec[] = [
    {
      id: "g",
      kind: "force",
      color: RED,
      x1: block.cx,
      y1: block.cy,
      dir: { x: 0, y: 1 },
      len: 86,
      label: "重力 mg",
      labelSide: 1,
      labelOver: 14,
      labelPerp: 14,
    },
    {
      id: "N",
      kind: "force",
      color: RED,
      x1: block.cx,
      y1: block.cy,
      dir: NRM,
      len: 84,
      label: "垂直抗力 N",
      labelSide: -1,
      labelOver: 14,
      labelPerp: 14,
    },
    {
      id: "f",
      kind: "force",
      color: RED,
      x1: block.cx,
      y1: block.cy,
      dir: UP,
      len: 66,
      label: "摩擦力 f",
      labelSide: -1,
      labelOver: 14,
      labelPerp: 14,
    },
    {
      id: "v",
      kind: "kinematic",
      color: GREEN,
      x1: kinAnchor.x + kinShift.x,
      y1: kinAnchor.y + kinShift.y,
      dir: DOWN,
      len: vLen,
      label: "速度 v",
      labelSide: 1,
      labelOver: 12,
      labelPerp: 10,
    },
    {
      id: "a",
      kind: "kinematic",
      color: AMBER,
      x1: kinAnchor.x - kinShift.x + DOWN.x * 8,
      y1: kinAnchor.y - kinShift.y + DOWN.y * 8,
      dir: DOWN,
      len: aLen,
      label: "加速度 a",
      labelSide: -1,
      labelOver: 10,
      labelPerp: 12,
    },
  ];

  const withTips = arrows.map((a) => ({
    ...a,
    x2: a.x1 + a.dir.x * a.len,
    y2: a.y1 + a.dir.y * a.len,
  }));

  // Trajectory: from a point just past the block to the slope foot, so it
  // naturally shortens as the block slides down.
  const trajFrom = {
    x: block.cx + DOWN.x * 44,
    y: block.cy + DOWN.y * 44,
  };
  const footBlock = {
    x: SLOPE_L.x + NRM.x * BLOCK_HALF_H,
    y: SLOPE_L.y + NRM.y * BLOCK_HALF_H,
  };

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
        {/* Noise overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />

        {/* Focal glow behind the block — follows the block smoothly */}
        <div
          aria-hidden
          className="absolute rounded-full blur-3xl pointer-events-none transition-[left,top] duration-75"
          style={{
            width: "36%",
            height: "48%",
            left: `${(block.cx / VB_W) * 100}%`,
            top: `${(block.cy / VB_H) * 100}%`,
            transform: "translate(-50%, -50%)",
            opacity: opacity,
            background:
              "radial-gradient(circle, rgba(255,55,95,0.28) 0%, rgba(255,159,10,0.18) 35%, transparent 70%)",
          }}
        />

        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
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
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.55" />
            </filter>
            {/* NOTE: filterUnits=userSpaceOnUse is required. With the default
                 objectBoundingBox, a perfectly vertical (or horizontal) arrow
                 has a zero-width bbox and the filter region collapses to
                 nothing — the mg arrow (straight down) would simply not
                 render. Using userSpaceOnUse with an explicit region covering
                 the full viewBox guarantees every arrow renders. */}
            <filter
              id="heroGlow"
              x="0"
              y="0"
              width={VB_W}
              height={VB_H}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
            >
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {[
              { id: "heroMr", color: RED },
              { id: "heroMg", color: GREEN },
              { id: "heroMa", color: AMBER },
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

          {/* Ground */}
          <rect x="0" y="300" width={VB_W} height="40" fill="url(#heroHatch)" />
          <line x1="0" y1="300" x2={VB_W} y2="300" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

          {/* Slope */}
          <polygon
            points={`${SLOPE_L.x},${SLOPE_L.y} ${SLOPE_R.x},${SLOPE_L.y} ${SLOPE_R.x},${SLOPE_R.y}`}
            fill="url(#heroSlope)"
            stroke="url(#heroSlopeEdge)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <line
            x1={SLOPE_L.x}
            y1={SLOPE_L.y}
            x2={SLOPE_R.x}
            y2={SLOPE_R.y}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Angle θ */}
          {(() => {
            const rad = (ANGLE_DEG * Math.PI) / 180;
            const r = 74;
            const arcEndX = SLOPE_L.x + r * Math.cos(rad);
            const arcEndY = SLOPE_L.y - r * Math.sin(rad);
            return (
              <>
                <path
                  d={`M ${SLOPE_L.x + r} ${SLOPE_L.y} A ${r} ${r} 0 0 0 ${arcEndX} ${arcEndY}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="1"
                />
                <text
                  x={SLOPE_L.x + r * 0.62 * Math.cos(rad / 2)}
                  y={SLOPE_L.y - r * 0.62 * Math.sin(rad / 2) + 5}
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

          {/* Trajectory — from block toward slope foot, marching dashes */}
          <line
            x1={trajFrom.x}
            y1={trajFrom.y}
            x2={footBlock.x}
            y2={footBlock.y}
            stroke={GREEN}
            strokeOpacity={0.4 * opacity}
            strokeWidth="1.6"
            strokeDasharray="3 5"
            strokeLinecap="round"
            filter="url(#heroGlow)"
            style={{ animation: "heroDashMarch 1.2s linear infinite" }}
          />

          {/* Sliding scene — block + arrows + origin */}
          <g style={{ opacity, transition: "opacity 80ms linear" }}>
            {/* Block */}
            <g
              transform={`translate(${block.cx} ${block.cy}) rotate(${-ANGLE_DEG})`}
              filter="url(#heroBlockShadow)"
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

            {/* Origin halo pulse (CSS keyframes) */}
            <circle
              cx={block.cx}
              cy={block.cy}
              r={5}
              fill={RED}
              style={{ opacity: 0.35, animation: "heroOriginPulse 2s cubic-bezier(0.22,1,0.36,1) infinite" }}
            />
            <circle cx={block.cx} cy={block.cy} r={5} fill={RED} opacity={0.18} />
            <circle cx={block.cx} cy={block.cy} r={2.6} fill="rgba(255,255,255,0.95)" />

            {/* Arrows */}
            {withTips.map((a) => {
              const marker =
                a.color === RED
                  ? "url(#heroMr)"
                  : a.color === GREEN
                    ? "url(#heroMg)"
                    : "url(#heroMa)";
              return (
                <g key={a.id} filter="url(#heroGlow)">
                  <line
                    x1={a.x1}
                    y1={a.y1}
                    x2={a.x2}
                    y2={a.y2}
                    stroke={a.color}
                    strokeWidth={2.4}
                    markerEnd={marker}
                    strokeLinecap="round"
                  />
                  {a.kind === "kinematic" && (
                    <circle cx={a.x1} cy={a.y1} r={2.4} fill={a.color} />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* AI scan sweep — band + leading edge line */}
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
            background: "linear-gradient(180deg, transparent, rgba(48,209,88,0.9), transparent)",
            boxShadow: "0 0 12px rgba(48,209,88,0.6)",
            animation: "heroScanSweep 5s cubic-bezier(0.65,0,0.35,1) infinite",
            animationDelay: "1.5s",
          }}
        />

        {/* HTML labels — glass pills Apple-style, follow the arrows */}
        <div style={{ opacity, transition: "opacity 80ms linear" }}>
          {withTips.map((a) => {
            const perp = { x: -a.dir.y, y: a.dir.x };
            const side = a.labelSide;
            const over = a.labelOver;
            const perpAmt = a.labelPerp;
            const lx = a.x2 + a.dir.x * over + perp.x * perpAmt * side;
            const ly = a.y2 + a.dir.y * over + perp.y * perpAmt * side;
            return (
              <HeroLabel
                key={a.id}
                x={lx / VB_W}
                y={ly / VB_H}
                color={a.color}
                label={a.label}
              />
            );
          })}
        </div>

        {/* Live analysis badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-[0_4px_14px_rgba(0,0,0,0.25)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/90 z-30">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
              style={{ background: GREEN }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }}
            />
          </span>
          リアルタイム解析 · シミュレーション
        </div>

        {/* Legend */}
        <div className="absolute right-3 bottom-3 flex items-center gap-3 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/80 z-30">
          <LegendSwatch color={RED} label="力" />
          <LegendSwatch color={GREEN} label="速度" />
          <LegendSwatch color={AMBER} label="加速度" />
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted leading-relaxed text-center">
        斜面を滑り降りる物体の運動をリアルタイムに解析。力は物体に、速度・加速度は軌道上に描画。
      </p>
    </div>
  );
}

function HeroLabel({
  x,
  y,
  color,
  label,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}) {
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-medium tracking-wide bg-white/[0.08] backdrop-blur-md border border-white/15 text-white/95 shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
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
        style={{ width: 6, height: 6, background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </span>
  );
}
