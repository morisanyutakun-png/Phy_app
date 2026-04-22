"use client";

import { useEffect, useRef, useState } from "react";
import type { ArrowToggles, SimParams, SimType } from "@/lib/problems";
import { cn } from "@/lib/cn";

// ============================================================================
// Constants
// ============================================================================
const VB_W = 500;
const VB_H = 340;
const RED = "#FF375F";
const RED_LIGHT = "#FFA0B5";
const GREEN = "#30D158";
const AMBER = "#FF9F0A";
const G = 9.81; // m/s²

// Scene-unit scale. Chosen so typical classroom numbers (θ≈25°, μ≈0.2, F≈20 N)
// animate slowly enough for students to read labels without feeling dizzy.
// Per-scene overrides appear inside each scene component.
const TIME_SCALE = 0.65;
// How many viewBox pixels represent one metre of real-world travel. Set
// independently per scene so that, at default parameters, each loop takes
// roughly 2-3 seconds — fast enough to feel alive, slow enough to follow.
const PX_PER_M_HORIZONTAL = 18;
const PX_PER_M_INCLINE = 62;

// ============================================================================
// Top-level
// ============================================================================

interface Props {
  type: SimType;
  params: SimParams;
  arrows: ArrowToggles;
  onTelemetry?: (t: Telemetry) => void;
  paused?: boolean;
  resetKey?: number;
  className?: string;
}

export interface Telemetry {
  t: number;
  speed: number;
  accel: number;
}

export function PhysicsSimulation({
  type,
  params,
  arrows,
  onTelemetry,
  paused = false,
  resetKey = 0,
  className,
}: Props) {
  const [t, setT] = useState(0);
  const startRef = useRef<number | null>(null);
  const pauseAtRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    pauseAtRef.current = 0;
    setT(0);
  }, [resetKey]);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    const loop = (now: number) => {
      if (startRef.current == null) {
        startRef.current = now - pauseAtRef.current * 1000;
      }
      const elapsed = ((now - startRef.current) / 1000) * TIME_SCALE;
      setT(elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      pauseAtRef.current = t;
      startRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, resetKey]);

  return (
    <div
      className={cn(
        "relative aspect-[500/340] rounded-[24px] overflow-hidden",
        "shadow-[0_24px_60px_-18px_rgba(11,16,40,0.5),0_6px_14px_-6px_rgba(11,16,40,0.35)]",
        className
      )}
      style={{
        background:
          "radial-gradient(120% 90% at 0% 0%, #1E1746 0%, #0E1230 45%, #07081B 100%)",
      }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs />
        {type === "horizontal" && <HorizontalScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />}
        {type === "incline" && <InclineScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />}
        {type === "spring" && <SpringScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />}
        {type === "circular" && <CircularScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />}
        {type === "projectile" && <ProjectileScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />}
      </svg>
    </div>
  );
}

// ============================================================================
// SVG defs
// ============================================================================
function Defs() {
  return (
    <defs>
      <linearGradient id="simBlock" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A2560" />
        <stop offset="50%" stopColor="#14183B" />
        <stop offset="100%" stopColor="#0A0B1F" />
      </linearGradient>
      <linearGradient id="simBlockTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <linearGradient id="simSlope" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
      </linearGradient>
      <pattern id="simHatch" patternUnits="userSpaceOnUse" width="11" height="11" patternTransform="rotate(45)">
        <rect width="11" height="11" fill="transparent" />
        <line x1="0" y1="0" x2="0" y2="11" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      </pattern>
      <filter id="simBlockShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.55" />
      </filter>
      <filter
        id="simGlow"
        x="0"
        y="0"
        width={VB_W}
        height={VB_H}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
      >
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {[
        { id: "headR", color: RED },
        { id: "headRL", color: RED_LIGHT },
        { id: "headG", color: GREEN },
        { id: "headA", color: AMBER },
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
  );
}

// ============================================================================
// Reusable SVG primitives
// ============================================================================

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed?: boolean;
  width?: number;
  opacity?: number;
}
function SvgArrow({ x1, y1, x2, y2, color, dashed, width = 2.4, opacity = 1 }: ArrowProps) {
  const head =
    color === RED ? "headR" : color === RED_LIGHT ? "headRL" : color === GREEN ? "headG" : "headA";
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return null;
  return (
    <g filter="url(#simGlow)">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? "5 3" : undefined}
        strokeOpacity={opacity}
        markerEnd={`url(#${head})`}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Pure-SVG label (no foreignObject). Self-clamps to the viewBox so it never
 *  leaks off the edge. Renders a dark rounded pill, a colored LED dot, and
 *  the label text, centered on (x, y). */
interface LabelProps {
  x: number;
  y: number;
  color: string;
  text: string;
}
function SvgLabel({ x, y, color, text }: LabelProps) {
  // Rough text width estimation: 7px per JP char, 5.2px per ASCII, + 22 padding.
  const asciiCount = [...text].filter((c) => c.charCodeAt(0) < 128).length;
  const jpCount = text.length - asciiCount;
  const width = Math.max(44, asciiCount * 5.2 + jpCount * 11 + 22);
  const height = 18;
  const cx = Math.max(width / 2 + 2, Math.min(VB_W - width / 2 - 2, x));
  const cy = Math.max(height / 2 + 2, Math.min(VB_H - height / 2 - 2, y));
  const left = cx - width / 2;
  return (
    <g pointerEvents="none">
      <rect
        x={left}
        y={cy - height / 2}
        width={width}
        height={height}
        rx={9}
        fill="rgba(10,14,35,0.86)"
        stroke={color}
        strokeWidth={0.9}
        strokeOpacity={0.9}
      />
      <circle cx={left + 8} cy={cy} r={2.4} fill={color} />
      <text x={left + 14} y={cy + 3.6} fontSize={10.5} fontWeight={600} fill="rgba(255,255,255,0.95)">
        {text}
      </text>
    </g>
  );
}

function Block({
  cx,
  cy,
  angleDeg,
  w = 60,
  h = 44,
  label = "m",
}: {
  cx: number;
  cy: number;
  angleDeg: number;
  w?: number;
  h?: number;
  label?: string;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${-angleDeg})`} filter="url(#simBlockShadow)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="url(#simBlock)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <rect x={-w / 2 + 2} y={-h / 2 + 2} width={w - 4} height={12} rx={4} fill="url(#simBlockTop)" opacity={0.5} />
      <text x={0} y={5} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize={16} fontWeight={600} fontStyle="italic" fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif">
        {label}
      </text>
    </g>
  );
}

// ============================================================================
// Scene: HORIZONTAL
// ============================================================================
function HorizontalScene({
  t,
  params,
  arrows,
  onTelemetry,
}: {
  t: number;
  params: SimParams;
  arrows: ArrowToggles;
  onTelemetry?: (t: Telemetry) => void;
}) {
  const F = params.force ?? 20;
  const mu = params.frictionMu ?? 0;
  const m = params.mass ?? 1;
  const staticLimit = mu * m * G;
  const isStatic = F <= staticLimit;
  const a = isStatic ? 0 : (F - staticLimit) / m;

  // Geometry: block sits ON the ground (its bottom face coincides with the
  // ground line), not floating above it.
  const GROUND_Y = 240;
  const BLOCK_W = 60;
  const BLOCK_H = 44;
  const BLOCK_HALF_H = BLOCK_H / 2;
  const BLOCK_HALF_W = BLOCK_W / 2;
  const cy = GROUND_Y - BLOCK_HALF_H; // 218 — block bottom exactly at ground

  // Motion range picked so that at the widest arrow configuration (max F
  // to the right and max friction label to the left) nothing leaves frame.
  const SCENE_LEFT = 160;
  const SCENE_RIGHT = 340;
  const SCENE_LEN = SCENE_RIGHT - SCENE_LEFT;
  const loopTime = isStatic
    ? 3
    : Math.sqrt((2 * SCENE_LEN) / (a * PX_PER_M_HORIZONTAL));
  const tt = isStatic ? 0 : t % (loopTime + 0.5);
  const slidePhase = Math.min(tt, loopTime);
  const sPx = isStatic
    ? 0
    : 0.5 * (a * PX_PER_M_HORIZONTAL) * slidePhase * slidePhase;
  const v = isStatic ? 0 : a * slidePhase;

  const cx = SCENE_LEFT + Math.min(sPx, SCENE_LEN);
  const contactX = cx;
  const contactY = GROUND_Y;

  useSendTelemetry(onTelemetry, { t, speed: v, accel: a });

  // Arrow lengths
  const fPx = Math.min(78, F * 3.4);
  const frictPx = Math.min(64, staticLimit * 3.4);
  const vPx = Math.min(80, v * 9);
  const aPx = Math.min(42, a * 4);

  // Slight x-offset so mg and N, which are both vertical on the same cx,
  // don't overlap each other visually inside the block.
  const MG_X = cx + 6;
  const N_X = cx - 6;

  return (
    <>
      <rect x="0" y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y} fill="url(#simHatch)" />
      <line x1="0" y1={GROUND_Y} x2={VB_W} y2={GROUND_Y} stroke="rgba(255,255,255,0.38)" strokeWidth="1.2" />

      <Block cx={cx} cy={cy} angleDeg={0} w={BLOCK_W} h={BLOCK_H} />

      {arrows.force && (
        <>
          {/* mg — from center of mass straight down */}
          <SvgArrow x1={MG_X} y1={cy} x2={MG_X} y2={cy + 46} color={RED} />
          <SvgLabel x={MG_X + 18} y={cy + 54} color={RED} text="重力 mg" />
          {/* tiny dot at the point of application (centre of mass) */}
          <circle cx={MG_X} cy={cy} r={1.8} fill={RED} />

          {/* N — from the ground-contact point straight up (作用点 = 床との境界) */}
          <SvgArrow x1={N_X} y1={contactY} x2={N_X} y2={contactY - 54} color={RED} />
          <SvgLabel x={N_X - 22} y={contactY - 62} color={RED} text="垂直抗力 N" />
          <circle cx={N_X} cy={contactY} r={1.8} fill={RED} />

          {/* F — applied force at the centre of mass, pointing right */}
          {F > 0 && (
            <>
              <SvgArrow x1={cx} y1={cy} x2={cx + BLOCK_HALF_W + fPx} y2={cy} color={RED} />
              <SvgLabel x={cx + BLOCK_HALF_W + fPx + 26} y={cy} color={RED} text="外力 F" />
            </>
          )}

          {/* Friction — from the ground contact, along the floor (作用点 = 床と物体の境界) */}
          {frictPx > 0 && !isStatic && (
            <>
              <SvgArrow x1={contactX} y1={contactY} x2={contactX - frictPx} y2={contactY} color={RED} />
              <SvgLabel x={contactX - frictPx - 28} y={contactY + 2} color={RED} text="摩擦 f" />
              <circle cx={contactX} cy={contactY} r={1.8} fill={RED} />
            </>
          )}
        </>
      )}

      {/* Kinematic arrows — drawn outside the block so they don't
          overlap the force arrows. v is placed above the block (between
          N's label and the block top), a just below v. */}
      {arrows.velocity && vPx > 4 && (
        <>
          <SvgArrow x1={cx + 30} y1={cy - 28} x2={cx + 30 + vPx} y2={cy - 28} color={GREEN} width={2.0} />
          <SvgLabel x={cx + 30 + vPx + 28} y={cy - 28} color={GREEN} text="速度 v" />
        </>
      )}
      {arrows.acceleration && aPx > 2 && (
        <>
          <SvgArrow x1={cx + 30} y1={cy - 8} x2={cx + 30 + aPx} y2={cy - 8} color={AMBER} width={1.8} />
          <SvgLabel x={cx + 30 + aPx + 30} y={cy - 8} color={AMBER} text="加速度 a" />
        </>
      )}
    </>
  );
}

// ============================================================================
// Scene: INCLINE
// ============================================================================
function InclineScene({
  t,
  params,
  arrows,
  onTelemetry,
}: {
  t: number;
  params: SimParams;
  arrows: ArrowToggles;
  onTelemetry?: (t: Telemetry) => void;
}) {
  const angleDeg = Math.max(3, Math.min(65, params.angle ?? 25));
  const mu = params.frictionMu ?? 0;
  const rad = (angleDeg * Math.PI) / 180;
  const sinT = Math.sin(rad);
  const cosT = Math.cos(rad);
  const a = Math.max(0, G * (sinT - mu * cosT));
  const isStatic = a <= 0.001;

  // Slope geometry. Clamp horizontalSpan so even at steep angles the slope
  // rise stays within a fixed budget of pixels, keeping everything on-screen.
  const maxRise = 200;
  const maxSpan = 380;
  const minSpan = 120;
  const horizontalSpan = Math.max(
    minSpan,
    Math.min(maxSpan, maxRise / Math.max(Math.tan(rad), 0.08))
  );
  const slopeLeftX = 60 + Math.max(0, (maxSpan - horizontalSpan) / 2);
  const SLOPE_L = { x: slopeLeftX, y: 280 };
  const SLOPE_R = {
    x: slopeLeftX + horizontalSpan,
    y: 280 - horizontalSpan * Math.tan(rad),
  };
  const UP = { x: cosT, y: -sinT };
  const DOWN = { x: -cosT, y: sinT };
  const NRM = { x: -sinT, y: -cosT };
  const INTO = { x: sinT, y: cosT };
  const blockHalfH = 22;

  const slopeLen = Math.hypot(SLOPE_R.x - SLOPE_L.x, SLOPE_R.y - SLOPE_L.y);
  const START_S = 0.8;
  const END_S = 0.22;
  const slideDistPx = (START_S - END_S) * slopeLen;
  const loopTime = isStatic
    ? 3
    : Math.sqrt((2 * slideDistPx) / (a * PX_PER_M_INCLINE));
  const cycle = loopTime + 0.6;

  const tt = t % cycle;
  const slidePhase = Math.min(tt, loopTime);
  const sPx = isStatic
    ? 0
    : 0.5 * (a * PX_PER_M_INCLINE) * slidePhase * slidePhase;
  const v = isStatic ? 0 : a * slidePhase;

  const s = START_S - Math.min(sPx, slideDistPx) / slopeLen;
  // `sp` is the slope surface contact point — used as the point of
  // application for N and f, which physically act at the floor-block
  // boundary, not at the block's centre of mass.
  const sp = {
    x: SLOPE_L.x + (SLOPE_R.x - SLOPE_L.x) * s,
    y: SLOPE_L.y + (SLOPE_R.y - SLOPE_L.y) * s,
  };
  const block = { cx: sp.x + NRM.x * blockHalfH, cy: sp.y + NRM.y * blockHalfH };

  useSendTelemetry(onTelemetry, { t, speed: v, accel: a });

  // Arrow lengths
  const MG_LEN = 72;
  const N_LEN = 68;
  const F_FRICT_LEN = mu > 0 ? Math.min(56, mu * G * cosT * 5.5) : 0;
  const V_LEN = Math.min(60, v * 8 + 18);
  const A_LEN = isStatic ? 0 : Math.min(46, a * 4 + 12);

  const mgTip = { x: block.cx, y: block.cy + MG_LEN };
  const mgSinTip = { x: block.cx + DOWN.x * (MG_LEN * sinT), y: block.cy + DOWN.y * (MG_LEN * sinT) };
  const mgCosTip = { x: block.cx + INTO.x * (MG_LEN * cosT), y: block.cy + INTO.y * (MG_LEN * cosT) };

  // Angle arc sizing — shrink at steep angles so it fits
  const arcR = Math.min(52, horizontalSpan * 0.3);

  return (
    <>
      <rect x="0" y="280" width={VB_W} height={VB_H - 280} fill="url(#simHatch)" />
      <line x1="0" y1="280" x2={VB_W} y2="280" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <polygon
        points={`${SLOPE_L.x},${SLOPE_L.y} ${SLOPE_R.x},${SLOPE_L.y} ${SLOPE_R.x},${SLOPE_R.y}`}
        fill="url(#simSlope)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.2"
      />
      <line x1={SLOPE_L.x} y1={SLOPE_L.y} x2={SLOPE_R.x} y2={SLOPE_R.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />

      {/* angle θ */}
      <path
        d={`M ${SLOPE_L.x + arcR} ${SLOPE_L.y} A ${arcR} ${arcR} 0 0 0 ${SLOPE_L.x + arcR * cosT} ${SLOPE_L.y - arcR * sinT}`}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      <text
        x={SLOPE_L.x + arcR * 0.6 * Math.cos(rad / 2) + 6}
        y={SLOPE_L.y - arcR * 0.6 * Math.sin(rad / 2) + 4}
        fontSize="14"
        fill="rgba(255,255,255,0.8)"
        fontStyle="italic"
      >
        θ
      </text>

      <Block cx={block.cx} cy={block.cy} angleDeg={angleDeg} />

      {arrows.force && (
        <>
          {/* mg — from centre of mass, straight down (重心) */}
          <SvgArrow x1={block.cx} y1={block.cy} x2={mgTip.x} y2={mgTip.y} color={RED} />
          <SvgLabel x={mgTip.x + 26} y={mgTip.y + 2} color={RED} text="重力 mg" />
          <circle cx={block.cx} cy={block.cy} r={1.8} fill={RED} />

          {/* N — from the slope contact point (作用点 = 斜面と物体の境界) */}
          <SvgArrow
            x1={sp.x}
            y1={sp.y}
            x2={sp.x + NRM.x * N_LEN}
            y2={sp.y + NRM.y * N_LEN}
            color={RED}
          />
          <SvgLabel
            x={sp.x + NRM.x * (N_LEN + 22)}
            y={sp.y + NRM.y * (N_LEN + 22)}
            color={RED}
            text="垂直抗力 N"
          />
          <circle cx={sp.x} cy={sp.y} r={1.8} fill={RED} />

          {/* Friction — from the slope contact, along the surface up-slope */}
          {F_FRICT_LEN > 0 && !isStatic && (
            <>
              <SvgArrow
                x1={sp.x}
                y1={sp.y}
                x2={sp.x + UP.x * F_FRICT_LEN}
                y2={sp.y + UP.y * F_FRICT_LEN}
                color={RED}
              />
              <SvgLabel
                x={sp.x + UP.x * (F_FRICT_LEN + 22) + NRM.x * 10}
                y={sp.y + UP.y * (F_FRICT_LEN + 22) + NRM.y * 10}
                color={RED}
                text="摩擦 f"
              />
            </>
          )}
        </>
      )}

      {arrows.decomposition && (
        <>
          <g stroke={RED_LIGHT} strokeWidth={0.7} strokeDasharray="2 3" opacity={0.55}>
            <line x1={mgSinTip.x} y1={mgSinTip.y} x2={mgTip.x} y2={mgTip.y} />
            <line x1={mgCosTip.x} y1={mgCosTip.y} x2={mgTip.x} y2={mgTip.y} />
          </g>
          <SvgArrow x1={block.cx} y1={block.cy} x2={mgSinTip.x} y2={mgSinTip.y} color={RED_LIGHT} dashed width={1.9} />
          <SvgLabel
            x={mgSinTip.x + DOWN.x * 14 + NRM.x * 18}
            y={mgSinTip.y + DOWN.y * 14 + NRM.y * 18}
            color={RED_LIGHT}
            text="mg sinθ"
          />
          <SvgArrow x1={block.cx} y1={block.cy} x2={mgCosTip.x} y2={mgCosTip.y} color={RED_LIGHT} dashed width={1.7} />
          <SvgLabel
            x={mgCosTip.x + INTO.x * 14 + UP.x * 16}
            y={mgCosTip.y + INTO.y * 14 + UP.y * 16}
            color={RED_LIGHT}
            text="mg cosθ"
          />
        </>
      )}

      {/* Kinematic vectors offset down-slope so v / a are clearly detached
          from the block's center of mass. */}
      {V_LEN > 0 && v > 0.05 && arrows.velocity && (
        <>
          <SvgArrow
            x1={block.cx + DOWN.x * 54}
            y1={block.cy + DOWN.y * 54}
            x2={block.cx + DOWN.x * (54 + V_LEN)}
            y2={block.cy + DOWN.y * (54 + V_LEN)}
            color={GREEN}
            width={2.0}
          />
          <SvgLabel
            x={block.cx + DOWN.x * (54 + V_LEN + 18) + NRM.x * 10}
            y={block.cy + DOWN.y * (54 + V_LEN + 18) + NRM.y * 10}
            color={GREEN}
            text="速度 v"
          />
        </>
      )}
      {A_LEN > 0 && arrows.acceleration && (
        <>
          <SvgArrow
            x1={block.cx + DOWN.x * 44 + INTO.x * 16}
            y1={block.cy + DOWN.y * 44 + INTO.y * 16}
            x2={block.cx + DOWN.x * (44 + A_LEN) + INTO.x * 16}
            y2={block.cy + DOWN.y * (44 + A_LEN) + INTO.y * 16}
            color={AMBER}
            width={1.8}
          />
          <SvgLabel
            x={block.cx + DOWN.x * (44 + A_LEN + 16) + INTO.x * 24}
            y={block.cy + DOWN.y * (44 + A_LEN + 16) + INTO.y * 24}
            color={AMBER}
            text="加速度 a"
          />
        </>
      )}
    </>
  );
}

// ============================================================================
// Scene: SPRING
// ============================================================================
function SpringScene({
  t,
  params,
  arrows,
  onTelemetry,
}: {
  t: number;
  params: SimParams;
  arrows: ArrowToggles;
  onTelemetry?: (t: Telemetry) => void;
}) {
  const k = params.k ?? 8;
  const m = params.mass ?? 1;
  const A = Math.max(0.05, Math.min(0.5, params.amplitude ?? 0.35));
  const omega = Math.sqrt(k / m);
  const x = A * Math.cos(omega * t);
  const v = -A * omega * Math.sin(omega * t);
  const accel = -omega * omega * x;

  const GROUND_Y = 250;
  const BLOCK_W = 60;
  const BLOCK_H = 48;
  const BLOCK_HALF_W = BLOCK_W / 2;
  const BLOCK_HALF_H = BLOCK_H / 2;
  const centerX = 300;
  const cy = GROUND_Y - BLOCK_HALF_H; // 226 — block sits on ground
  const px = centerX + x * 180;
  const wallX = 50;
  const contactX = px;
  const contactY = GROUND_Y;
  const MG_X = px + 6;
  const N_X = px - 6;
  const springAttachX = px - BLOCK_HALF_W; // spring attaches to left face

  useSendTelemetry(onTelemetry, { t, speed: Math.abs(v), accel: Math.abs(accel) });

  return (
    <>
      <rect x="0" y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y} fill="url(#simHatch)" />
      <line x1="0" y1={GROUND_Y} x2={VB_W} y2={GROUND_Y} stroke="rgba(255,255,255,0.38)" strokeWidth="1.2" />

      {/* wall, anchored to ground */}
      <rect x={wallX - 18} y={GROUND_Y - 130} width={14} height={130} fill="rgba(255,255,255,0.14)" />
      <rect x={wallX - 18} y={GROUND_Y - 130} width={14} height={130} fill="url(#simHatch)" opacity={0.6} />

      {/* natural length reference */}
      <line x1={centerX} y1={cy - 72} x2={centerX} y2={cy + BLOCK_HALF_H + 6} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 4" />
      <text x={centerX} y={cy - 78} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
        自然長
      </text>

      {/* spring coils — run from wall to the block's left face */}
      <SpringPath x0={wallX - 4} x1={springAttachX} cy={cy} />

      <Block cx={px} cy={cy} angleDeg={0} w={BLOCK_W} h={BLOCK_H} />

      {arrows.force && (
        <>
          {/* spring force = -k x (applied at the spring's attachment point,
              which is the block's left face) */}
          {Math.abs(x) > 0.02 && (() => {
            const forceLen = Math.min(84, Math.abs(k * x) * 5);
            const sign = Math.sign(x);
            const tailX = springAttachX;
            const tipX = tailX - sign * forceLen;
            return (
              <>
                <SvgArrow x1={tailX} y1={cy} x2={tipX} y2={cy} color={RED} />
                <SvgLabel x={tipX - sign * 36} y={cy} color={RED} text="弾性力 −kx" />
                <circle cx={tailX} cy={cy} r={1.8} fill={RED} />
              </>
            );
          })()}
          {/* N — from ground contact, straight up */}
          <SvgArrow x1={N_X} y1={contactY} x2={N_X} y2={contactY - 62} color={RED} />
          <SvgLabel x={N_X - 18} y={contactY - 70} color={RED} text="垂直抗力 N" />
          <circle cx={N_X} cy={contactY} r={1.8} fill={RED} />
          {/* mg — from centre of mass, straight down */}
          <SvgArrow x1={MG_X} y1={cy} x2={MG_X} y2={cy + 36} color={RED} />
          <SvgLabel x={MG_X + 18} y={cy + 44} color={RED} text="重力 mg" />
          <circle cx={MG_X} cy={cy} r={1.8} fill={RED} />
        </>
      )}

      {arrows.velocity && Math.abs(v) > 0.03 && (() => {
        const vLen = Math.min(74, Math.abs(v) * 65);
        const sign = Math.sign(v);
        return (
          <>
            <SvgArrow
              x1={px + sign * 30}
              y1={cy - 82}
              x2={px + sign * (30 + vLen * 0.85)}
              y2={cy - 82}
              color={GREEN}
              width={2}
            />
            <SvgLabel x={px + sign * (30 + vLen * 0.85 + 22)} y={cy - 82} color={GREEN} text="速度 v" />
          </>
        );
      })()}
      {arrows.acceleration && Math.abs(accel) > 0.05 && (() => {
        const aLen = Math.min(56, Math.abs(accel) * 5.5);
        const sign = Math.sign(accel);
        return (
          <>
            <SvgArrow
              x1={px + sign * 30}
              y1={cy - 60}
              x2={px + sign * (30 + aLen)}
              y2={cy - 60}
              color={AMBER}
              width={1.8}
            />
            <SvgLabel x={px + sign * (30 + aLen + 24)} y={cy - 60} color={AMBER} text="加速度 a" />
          </>
        );
      })()}
    </>
  );
}

function SpringPath({ x0, x1, cy }: { x0: number; x1: number; cy: number }) {
  const length = x1 - x0;
  if (length <= 16) {
    return <line x1={x0} y1={cy} x2={x1} y2={cy} stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" />;
  }
  const coils = 10;
  const samples = 220;
  const pitch = length / coils;
  const skew = pitch * 0.45;
  const radius = 12;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const th = u * coils * 2 * Math.PI - Math.PI / 2;
    const alongX = x0 + u * length;
    const pxi = alongX + (Math.sin(th) + 1) * skew;
    const py = cy - Math.cos(th) * radius;
    pts.push(`${i === 0 ? "M" : "L"}${pxi.toFixed(2)},${py.toFixed(2)}`);
  }
  return <path d={pts.join(" ")} stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

// ============================================================================
// Scene: CIRCULAR
// ============================================================================
function CircularScene({
  t,
  params,
  arrows,
  onTelemetry,
}: {
  t: number;
  params: SimParams;
  arrows: ArrowToggles;
  onTelemetry?: (t: Telemetry) => void;
}) {
  const R = params.radius ?? 0.3;
  const omega = params.omega ?? 1.6;
  // Smaller Rpx so block + arrows + labels all fit within the viewBox regardless
  // of where the block is on the circle.
  const Rpx = Math.min(88, R * 300);

  const cx = 250;
  const cy = 165;
  const theta = omega * t;

  const bx = cx + Rpx * Math.cos(theta);
  const by = cy + Rpx * Math.sin(theta);

  const speed = Math.abs(omega) * R;
  const accel = omega * omega * R;

  useSendTelemetry(onTelemetry, { t, speed, accel });

  // Unit vectors in the frame
  const inward = { x: -Math.cos(theta), y: -Math.sin(theta) };
  const outward = { x: Math.cos(theta), y: Math.sin(theta) };
  const tan = { x: -Math.sin(theta) * Math.sign(omega), y: Math.cos(theta) * Math.sign(omega) };

  // Arrow lengths — kept small enough that they never leave the frame.
  const T_LEN = 58;
  const V_LEN = Math.min(56, 22 + speed * 40);
  const A_LEN = Math.min(40, 14 + accel * 14);

  return (
    <>
      <circle cx={cx} cy={cy} r={Rpx} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 5" fill="none" />
      <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.75)" />
      <text x={cx - 8} y={cy - 8} fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="end">
        O
      </text>

      <line x1={cx} y1={cy} x2={bx} y2={by} stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />

      <circle cx={bx} cy={by} r={20} fill="url(#simBlock)" filter="url(#simBlockShadow)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <circle cx={bx - 5} cy={by - 5} r={4} fill="rgba(255,255,255,0.2)" />
      <text
        x={bx}
        y={by + 4}
        textAnchor="middle"
        fill="rgba(255,255,255,0.92)"
        fontSize="13"
        fontStyle="italic"
        fontWeight={600}
        fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif"
      >
        m
      </text>

      {arrows.force && (
        <>
          {/* Tension — applied at the string's attachment on the ball's
              inward-facing surface (作用点 = ひもが結ばれている点). */}
          {(() => {
            const ballR = 20;
            const attachX = bx + inward.x * ballR;
            const attachY = by + inward.y * ballR;
            return (
              <>
                <SvgArrow
                  x1={attachX}
                  y1={attachY}
                  x2={attachX + inward.x * T_LEN}
                  y2={attachY + inward.y * T_LEN}
                  color={RED}
                />
                <circle cx={attachX} cy={attachY} r={1.8} fill={RED} />
                <SvgLabel
                  x={bx + outward.x * 32}
                  y={by + outward.y * 32}
                  color={RED}
                  text="張力 T"
                />
              </>
            );
          })()}
        </>
      )}

      {arrows.velocity && (
        <>
          <SvgArrow x1={bx} y1={by} x2={bx + tan.x * V_LEN} y2={by + tan.y * V_LEN} color={GREEN} width={2.0} />
          <SvgLabel
            x={bx + tan.x * (V_LEN + 16) + outward.x * 8}
            y={by + tan.y * (V_LEN + 16) + outward.y * 8}
            color={GREEN}
            text="速度 v"
          />
        </>
      )}
      {arrows.acceleration && (
        <>
          {/* Acceleration: inward, offset perpendicular to tension so the
              two arrows don't exactly overlap. */}
          <SvgArrow
            x1={bx + tan.x * 8}
            y1={by + tan.y * 8}
            x2={bx + tan.x * 8 + inward.x * A_LEN}
            y2={by + tan.y * 8 + inward.y * A_LEN}
            color={AMBER}
            width={1.8}
          />
          <SvgLabel
            x={bx + tan.x * 8 + inward.x * (A_LEN + 18)}
            y={by + tan.y * 8 + inward.y * (A_LEN + 18)}
            color={AMBER}
            text="向心加速度 a"
          />
        </>
      )}
    </>
  );
}

// ============================================================================
// Scene: PROJECTILE
// ============================================================================
function ProjectileScene({
  t,
  params,
  arrows,
  onTelemetry,
}: {
  t: number;
  params: SimParams;
  arrows: ArrowToggles;
  onTelemetry?: (t: Telemetry) => void;
}) {
  const v0 = params.v0 ?? 1.2;
  const angleDeg = Math.max(0, Math.min(85, params.launchAngle ?? 55));
  const rad = (angleDeg * Math.PI) / 180;

  const gSim = 1.4;
  const vx = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);
  // For horizontal-ish launches, launch from a cliff so there's flight to watch.
  const isCliff = angleDeg <= 3;
  const launchHeight = isCliff ? 0.55 : 0;

  const flightTime = isCliff
    ? Math.sqrt((2 * launchHeight) / gSim)
    : Math.max(0.5, (2 * vy0) / gSim);
  const cycleTime = Math.max(flightTime + 0.6, 1.2);

  const tt = t % cycleTime;
  const alive = tt <= flightTime;
  const xSim = vx * tt;
  const ySim = isCliff
    ? launchHeight - 0.5 * gSim * tt * tt
    : vy0 * tt - 0.5 * gSim * tt * tt;
  const vyNow = isCliff ? -gSim * tt : vy0 - gSim * tt;

  // viewBox mapping — cliff launches from upper-left; oblique from lower-left.
  const ORIGIN_X = isCliff ? 88 : 70;
  const ORIGIN_Y = isCliff ? 90 : 262;
  // Auto-scale so the peak and full range fit comfortably.
  const xMax = vx * flightTime;
  const yMax = isCliff ? launchHeight : (vy0 * vy0) / (2 * gSim);
  const SCALE_X = Math.min(170, (VB_W - ORIGIN_X - 50) / Math.max(xMax, 0.01));
  const SCALE_Y = isCliff
    ? Math.min(250, (252 - ORIGIN_Y) / Math.max(yMax, 0.01))
    : Math.min(180, (ORIGIN_Y - 30) / Math.max(yMax, 0.01));
  const SCALE = Math.min(SCALE_X, SCALE_Y);

  const px = alive ? ORIGIN_X + xSim * SCALE : ORIGIN_X + vx * flightTime * SCALE;
  const py = alive ? ORIGIN_Y - ySim * SCALE : ORIGIN_Y;

  const speed = Math.hypot(vx, vyNow);
  useSendTelemetry(onTelemetry, { t, speed, accel: gSim });

  const trajSamples = 36;
  const trajPts: string[] = [];
  for (let i = 0; i <= trajSamples; i++) {
    const tau = (i / trajSamples) * flightTime;
    const xi = vx * tau;
    const yi = isCliff ? launchHeight - 0.5 * gSim * tau * tau : vy0 * tau - 0.5 * gSim * tau * tau;
    trajPts.push(`${ORIGIN_X + xi * SCALE},${ORIGIN_Y - yi * SCALE}`);
  }

  // velocity decomposition scales
  const vArrowScale = 28;
  const vxArrowPx = vx * vArrowScale;
  const vyArrowPx = vyNow * vArrowScale;

  return (
    <>
      <rect x="0" y="255" width={VB_W} height={VB_H - 255} fill="url(#simHatch)" />
      <line x1="0" y1="255" x2={VB_W} y2="255" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {isCliff && (
        <rect x="0" y={ORIGIN_Y} width={ORIGIN_X - 6} height={255 - ORIGIN_Y} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      )}

      <polyline points={trajPts.join(" ")} fill="none" stroke="rgba(48,209,88,0.35)" strokeWidth="1.4" strokeDasharray="2 4" />

      <circle cx={ORIGIN_X} cy={ORIGIN_Y} r={3} fill="rgba(255,255,255,0.7)" />
      {!isCliff && (
        <>
          {/* launch angle θ arc at origin */}
          <path
            d={`M ${ORIGIN_X + 34} ${ORIGIN_Y} A 34 34 0 0 0 ${ORIGIN_X + 34 * Math.cos(rad)} ${ORIGIN_Y - 34 * Math.sin(rad)}`}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1"
          />
          <text x={ORIGIN_X + 22} y={ORIGIN_Y - 6} fontSize="12" fill="rgba(255,255,255,0.7)" fontStyle="italic">
            θ
          </text>
        </>
      )}

      <circle cx={px} cy={py} r={13} fill="url(#simBlock)" filter="url(#simBlockShadow)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <circle cx={px - 3} cy={py - 3} r={4} fill="rgba(255,255,255,0.25)" />

      {arrows.force && (
        <>
          {/* mg — from the centre of mass of the ball (作用点 = 重心) */}
          <SvgArrow x1={px + 6} y1={py} x2={px + 6} y2={py + 44} color={RED} />
          <SvgLabel x={px + 28} y={py + 52} color={RED} text="重力 mg" />
          <circle cx={px + 6} cy={py} r={1.8} fill={RED} />
        </>
      )}

      {arrows.velocity && (
        <>
          <SvgArrow x1={px} y1={py} x2={px + vx * vArrowScale} y2={py - vyNow * vArrowScale} color={GREEN} width={2.0} />
          <SvgLabel
            x={px + vx * vArrowScale + 22}
            y={py - vyNow * vArrowScale + (vyNow >= 0 ? -12 : 12)}
            color={GREEN}
            text="速度 v"
          />

          {arrows.decomposition && (
            <>
              {/* vₓ (horizontal, constant) */}
              <SvgArrow
                x1={px}
                y1={py}
                x2={px + vxArrowPx}
                y2={py}
                color={RED_LIGHT}
                dashed
                width={1.6}
              />
              <SvgLabel x={px + vxArrowPx + 26} y={py - 10} color={RED_LIGHT} text="v₀ cosθ" />

              {/* v_y (vertical, varying) */}
              <SvgArrow
                x1={px}
                y1={py}
                x2={px}
                y2={py - vyArrowPx}
                color={RED_LIGHT}
                dashed
                width={1.6}
              />
              <SvgLabel
                x={px - 26}
                y={py - vyArrowPx + (vyNow >= 0 ? -12 : 12)}
                color={RED_LIGHT}
                text="v_y"
              />

              {/* right-angle construction line (parallelogram) */}
              <line
                x1={px + vxArrowPx}
                y1={py}
                x2={px + vxArrowPx}
                y2={py - vyArrowPx}
                stroke={RED_LIGHT}
                strokeWidth={0.7}
                strokeDasharray="2 3"
                opacity={0.55}
              />
              <line
                x1={px}
                y1={py - vyArrowPx}
                x2={px + vxArrowPx}
                y2={py - vyArrowPx}
                stroke={RED_LIGHT}
                strokeWidth={0.7}
                strokeDasharray="2 3"
                opacity={0.55}
              />
            </>
          )}
        </>
      )}

      {arrows.acceleration && (
        <>
          {/* g — acceleration, also at centre of mass; offset left from mg so
              the two red/amber arrows don't perfectly overlap. */}
          <SvgArrow x1={px - 6} y1={py} x2={px - 6} y2={py + 36} color={AMBER} width={1.7} />
          <SvgLabel x={px - 32} y={py + 24} color={AMBER} text="加速度 g" />
        </>
      )}
    </>
  );
}

// ============================================================================
// Telemetry hook
// ============================================================================
function useSendTelemetry(
  cb: ((t: Telemetry) => void) | undefined,
  state: { t: number; speed: number; accel: number }
) {
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!cb) return;
    const now = performance.now();
    if (now - lastRef.current > 80) {
      lastRef.current = now;
      cb(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.t]);
}
