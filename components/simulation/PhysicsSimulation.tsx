"use client";

import { useEffect, useRef, useState } from "react";
import type { ArrowToggles, SimParams, SimType } from "@/lib/problems";
import { cn } from "@/lib/cn";

// ==== viewBox / palette ====================================================
const VB_W = 500;
const VB_H = 340;
const RED = "#FF375F";
const RED_LIGHT = "#FFA0B5";
const GREEN = "#30D158";
const AMBER = "#FF9F0A";
const G = 9.81; // m/s²

// Visual scaling for "physics units → viewBox units" chosen so typical
// classroom numbers render at a readable size inside the canvas.
const PX_PER_M = 100;
const TIME_SCALE = 0.9; // slow sim 10% so it reads more comfortably

interface Props {
  type: SimType;
  params: SimParams;
  arrows: ArrowToggles;
  /** called every frame with live kinematic readouts (used by the readout panel) */
  onTelemetry?: (t: Telemetry) => void;
  /** externally controlled pause state */
  paused?: boolean;
  /** externally controlled reset nonce — bumping it resets the clock */
  resetKey?: number;
  className?: string;
}

export interface Telemetry {
  t: number;
  speed: number;
  accel: number;
  label?: string;
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

  // Reset simulation time whenever resetKey changes.
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
        {type === "horizontal" && (
          <HorizontalScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />
        )}
        {type === "incline" && (
          <InclineScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />
        )}
        {type === "spring" && (
          <SpringScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />
        )}
        {type === "circular" && (
          <CircularScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />
        )}
        {type === "projectile" && (
          <ProjectileScene t={t} params={params} arrows={arrows} onTelemetry={onTelemetry} />
        )}
      </svg>
    </div>
  );
}

// ==== shared SVG defs =====================================================
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
      <pattern
        id="simHatch"
        patternUnits="userSpaceOnUse"
        width="11"
        height="11"
        patternTransform="rotate(45)"
      >
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

// Helper to render an arrow of given color + optional dashed/label tip
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
    color === RED
      ? "headR"
      : color === RED_LIGHT
        ? "headRL"
        : color === GREEN
          ? "headG"
          : "headA";
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return null; // suppress degenerate strokes
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

function SvgLabel({ x, y, color, children }: { x: number; y: number; color: string; children: React.ReactNode }) {
  return (
    <foreignObject x={x - 50} y={y - 12} width={100} height={24} style={{ overflow: "visible" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 7px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.95)",
          fontSize: 10,
          fontWeight: 600,
          whiteSpace: "nowrap",
          boxShadow: `0 2px 6px rgba(0,0,0,0.25)`,
          transform: "translate(-50%, 0)",
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        {children}
      </div>
    </foreignObject>
  );
}

// Rotated rectangle block with gloss + drop shadow
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
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={6}
        fill="url(#simBlock)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.6"
      />
      <rect x={-w / 2 + 2} y={-h / 2 + 2} width={w - 4} height={12} rx={4} fill="url(#simBlockTop)" opacity={0.5} />
      <text
        x={0}
        y={5}
        textAnchor="middle"
        fill="rgba(255,255,255,0.92)"
        fontSize={16}
        fontWeight={600}
        fontStyle="italic"
        fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif"
      >
        {label}
      </text>
    </g>
  );
}

// ==== scene: HORIZONTAL ===================================================
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

  // Scene distance between left wall and right edge, in pixels.
  const SCENE_LEFT = 60;
  const SCENE_RIGHT = 440;
  const SCENE_LEN = SCENE_RIGHT - SCENE_LEFT;

  // Block travels SCENE_LEN pixels per loop. Time to traverse:
  const loopPx = isStatic ? 1 : SCENE_LEN;
  const loopTime = isStatic ? 4 : Math.sqrt((2 * loopPx) / (a * PX_PER_M));

  const tt = isStatic ? 0 : t % loopTime;
  const sPx = isStatic ? 0 : 0.5 * (a * PX_PER_M) * tt * tt;
  const v = isStatic ? 0 : a * tt;

  const cx = SCENE_LEFT + Math.min(sPx, SCENE_LEN);
  const cy = 210;

  useSendTelemetry(onTelemetry, { t, speed: v, accel: a });

  return (
    <>
      {/* ground */}
      <rect x="0" y="240" width={VB_W} height={40} fill="url(#simHatch)" />
      <line x1="0" y1="240" x2={VB_W} y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <line x1={SCENE_LEFT} y1="240" x2={SCENE_RIGHT} y2="240" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />

      <Block cx={cx} cy={cy} angleDeg={0} w={64} h={48} />

      {/* arrows */}
      {arrows.force && (
        <>
          <SvgArrow x1={cx} y1={cy} x2={cx} y2={cy + 70} color={RED} />
          <SvgLabel x={cx} y={cy + 84} color={RED}>重力 mg</SvgLabel>

          <SvgArrow x1={cx} y1={cy} x2={cx} y2={cy - 70} color={RED} />
          <SvgLabel x={cx} y={cy - 86} color={RED}>垂直抗力 N</SvgLabel>

          {F > 0 && (
            <>
              <SvgArrow x1={cx + 24} y1={cy} x2={cx + 24 + Math.min(90, F * 3.5)} y2={cy} color={RED} />
              <SvgLabel x={cx + 24 + Math.min(90, F * 3.5) + 20} y={cy} color={RED}>外力 F</SvgLabel>
            </>
          )}

          {mu > 0 && !isStatic && (
            <>
              <SvgArrow x1={cx - 24} y1={cy + 6} x2={cx - 24 - Math.min(60, staticLimit * 3.5)} y2={cy + 6} color={RED} />
              <SvgLabel x={cx - 24 - Math.min(60, staticLimit * 3.5) - 24} y={cy + 10} color={RED}>摩擦力 f</SvgLabel>
            </>
          )}
        </>
      )}

      {arrows.velocity && v > 0.05 && (
        <>
          <SvgArrow
            x1={cx + 34}
            y1={cy + 30}
            x2={cx + 34 + Math.min(100, v * 10)}
            y2={cy + 30}
            color={GREEN}
            width={2.0}
          />
          <SvgLabel x={cx + 34 + Math.min(100, v * 10) + 18} y={cy + 30} color={GREEN}>速度 v</SvgLabel>
        </>
      )}

      {arrows.acceleration && !isStatic && (
        <>
          <SvgArrow x1={cx - 34} y1={cy + 30} x2={cx - 34 + a * 7} y2={cy + 30} color={AMBER} width={1.8} />
          <SvgLabel x={cx - 34 + a * 7 + 22} y={cy + 34} color={AMBER}>加速度 a</SvgLabel>
        </>
      )}
    </>
  );
}

// ==== scene: INCLINE ======================================================
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
  const angleDeg = params.angle ?? 25;
  const mu = params.frictionMu ?? 0;
  const rad = (angleDeg * Math.PI) / 180;
  const sinT = Math.sin(rad);
  const cosT = Math.cos(rad);
  const a = Math.max(0, G * (sinT - mu * cosT));
  const isStatic = a <= 0.001;

  // Geometry: slope from SLOPE_L to SLOPE_R, angle = angleDeg
  const SLOPE_L = { x: 50, y: 280 };
  const horizontalSpan = 400;
  const SLOPE_R = { x: SLOPE_L.x + horizontalSpan, y: SLOPE_L.y - horizontalSpan * Math.tan(rad) };
  const UP = { x: cosT, y: -sinT };
  const DOWN = { x: -cosT, y: sinT };
  const NRM = { x: -sinT, y: -cosT };
  const INTO = { x: sinT, y: cosT };
  const blockHalfH = 22;

  // Block starts at s=0.78, slides to s=0.2. Parameter s along slope (0=bottom).
  const slopeLen = Math.hypot(SLOPE_R.x - SLOPE_L.x, SLOPE_R.y - SLOPE_L.y);
  const START_S = 0.8;
  const END_S = 0.2;
  const slideDistPx = (START_S - END_S) * slopeLen;
  const loopTime = isStatic ? 3 : Math.sqrt((2 * slideDistPx) / (a * PX_PER_M));
  const PAUSE_TIME = 0.6;
  const cycle = loopTime + PAUSE_TIME;

  const tt = t % cycle;
  const slidePhase = Math.min(tt, loopTime);
  const sPx = isStatic ? 0 : 0.5 * (a * PX_PER_M) * slidePhase * slidePhase;
  const v = isStatic ? 0 : a * slidePhase;

  const s = START_S - Math.min(sPx, slideDistPx) / slopeLen;
  const sp = {
    x: SLOPE_L.x + (SLOPE_R.x - SLOPE_L.x) * s,
    y: SLOPE_L.y + (SLOPE_R.y - SLOPE_L.y) * s,
  };
  const block = { cx: sp.x + NRM.x * blockHalfH, cy: sp.y + NRM.y * blockHalfH };

  useSendTelemetry(onTelemetry, { t, speed: v, accel: a });

  const MG_LEN = 78;
  const mgTip = { x: block.cx, y: block.cy + MG_LEN };
  const mgSinTip = { x: block.cx + DOWN.x * (MG_LEN * sinT), y: block.cy + DOWN.y * (MG_LEN * sinT) };
  const mgCosTip = { x: block.cx + INTO.x * (MG_LEN * cosT), y: block.cy + INTO.y * (MG_LEN * cosT) };

  return (
    <>
      <rect x="0" y="280" width={VB_W} height={60} fill="url(#simHatch)" />
      <polygon
        points={`${SLOPE_L.x},${SLOPE_L.y} ${SLOPE_R.x},${SLOPE_L.y} ${SLOPE_R.x},${SLOPE_R.y}`}
        fill="url(#simSlope)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.2"
      />
      <line x1={SLOPE_L.x} y1={SLOPE_L.y} x2={SLOPE_R.x} y2={SLOPE_R.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />

      {/* angle θ */}
      <path
        d={`M ${SLOPE_L.x + 48} ${SLOPE_L.y} A 48 48 0 0 0 ${SLOPE_L.x + 48 * cosT} ${SLOPE_L.y - 48 * sinT}`}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      <text
        x={SLOPE_L.x + 28 * Math.cos(rad / 2) + 8}
        y={SLOPE_L.y - 28 * Math.sin(rad / 2) + 4}
        fontSize="14"
        fill="rgba(255,255,255,0.75)"
        fontStyle="italic"
      >
        θ
      </text>

      <Block cx={block.cx} cy={block.cy} angleDeg={angleDeg} />

      {/* force arrows */}
      {arrows.force && (
        <>
          {/* mg */}
          <SvgArrow x1={block.cx} y1={block.cy} x2={mgTip.x} y2={mgTip.y} color={RED} />
          <SvgLabel x={mgTip.x + 22} y={mgTip.y + 4} color={RED}>重力 mg</SvgLabel>
          {/* N */}
          <SvgArrow
            x1={block.cx}
            y1={block.cy}
            x2={block.cx + NRM.x * 72}
            y2={block.cy + NRM.y * 72}
            color={RED}
          />
          <SvgLabel x={block.cx + NRM.x * 86} y={block.cy + NRM.y * 86} color={RED}>垂直抗力 N</SvgLabel>
          {/* friction if moving and mu > 0 */}
          {mu > 0 && !isStatic && (
            <>
              <SvgArrow
                x1={block.cx}
                y1={block.cy}
                x2={block.cx + UP.x * 58}
                y2={block.cy + UP.y * 58}
                color={RED}
              />
              <SvgLabel x={block.cx + UP.x * 74} y={block.cy + UP.y * 74} color={RED}>摩擦力 f</SvgLabel>
            </>
          )}
        </>
      )}

      {/* decomposition */}
      {arrows.decomposition && (
        <>
          {/* construction lines */}
          <g stroke={RED_LIGHT} strokeWidth={0.7} strokeDasharray="2 3" opacity={0.55}>
            <line x1={mgSinTip.x} y1={mgSinTip.y} x2={mgTip.x} y2={mgTip.y} />
            <line x1={mgCosTip.x} y1={mgCosTip.y} x2={mgTip.x} y2={mgTip.y} />
          </g>
          <SvgArrow
            x1={block.cx}
            y1={block.cy}
            x2={mgSinTip.x}
            y2={mgSinTip.y}
            color={RED_LIGHT}
            dashed
            width={1.9}
          />
          <SvgLabel x={block.cx + DOWN.x * 64} y={block.cy + DOWN.y * 64 + 4} color={RED_LIGHT}>mg sinθ</SvgLabel>
          <SvgArrow
            x1={block.cx}
            y1={block.cy}
            x2={mgCosTip.x}
            y2={mgCosTip.y}
            color={RED_LIGHT}
            dashed
            width={1.7}
          />
          <SvgLabel x={block.cx + INTO.x * 96} y={block.cy + INTO.y * 96} color={RED_LIGHT}>mg cosθ</SvgLabel>
        </>
      )}

      {/* kinematic vectors, detached from block center */}
      {v > 0.05 && arrows.velocity && (
        <>
          <SvgArrow
            x1={block.cx + DOWN.x * 58}
            y1={block.cy + DOWN.y * 58}
            x2={block.cx + DOWN.x * (58 + v * 8 + 14)}
            y2={block.cy + DOWN.y * (58 + v * 8 + 14)}
            color={GREEN}
            width={2.0}
          />
          <SvgLabel
            x={block.cx + DOWN.x * (58 + v * 8 + 30)}
            y={block.cy + DOWN.y * (58 + v * 8 + 30)}
            color={GREEN}
          >
            速度 v
          </SvgLabel>
        </>
      )}
      {!isStatic && arrows.acceleration && (
        <>
          <SvgArrow
            x1={block.cx + DOWN.x * 44 + NRM.x * 14}
            y1={block.cy + DOWN.y * 44 + NRM.y * 14}
            x2={block.cx + DOWN.x * (44 + a * 4) + NRM.x * 14}
            y2={block.cy + DOWN.y * (44 + a * 4) + NRM.y * 14}
            color={AMBER}
            width={1.7}
          />
          <SvgLabel
            x={block.cx + DOWN.x * (44 + a * 4 + 16) + NRM.x * 14}
            y={block.cy + DOWN.y * (44 + a * 4 + 16) + NRM.y * 14}
            color={AMBER}
          >
            加速度 a
          </SvgLabel>
        </>
      )}
    </>
  );
}

// ==== scene: SPRING (SHM) =================================================
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
  const A = params.amplitude ?? 0.35;
  const omega = Math.sqrt(k / m);
  const x = A * Math.cos(omega * t); // displacement in normalized units (0..1-ish)
  const v = -A * omega * Math.sin(omega * t);
  const a = -omega * omega * x;

  const centerX = 300;
  const cy = 200;
  const px = centerX + x * 200; // viewBox displacement
  const wallX = 60;
  useSendTelemetry(onTelemetry, { t, speed: Math.abs(v), accel: Math.abs(a) });

  return (
    <>
      <rect x="0" y="260" width={VB_W} height={40} fill="url(#simHatch)" />
      <line x1="0" y1="260" x2={VB_W} y2="260" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

      {/* wall */}
      <rect x={wallX - 18} y={cy - 60} width={12} height={120} fill="rgba(255,255,255,0.12)" />
      <rect x={wallX - 18} y={cy - 60} width={12} height={120} fill="url(#simHatch)" opacity={0.6} />

      {/* natural length marker */}
      <line x1={centerX} y1={cy - 70} x2={centerX} y2={cy + 70} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 4" />
      <text x={centerX} y={cy - 76} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">自然長</text>

      {/* spring (helical projection) */}
      <SpringPath x0={wallX - 6} x1={px - 30} cy={cy} />

      <Block cx={px} cy={cy} angleDeg={0} w={60} h={52} />

      {arrows.force && (
        <>
          {/* spring force -kx (toward equilibrium) */}
          {Math.abs(x) > 0.02 && (
            <>
              <SvgArrow
                x1={px}
                y1={cy}
                x2={px - Math.sign(x) * Math.abs(k * x) * 6}
                y2={cy}
                color={RED}
              />
              <SvgLabel x={px - Math.sign(x) * (Math.abs(k * x) * 6 + 24)} y={cy} color={RED}>弾性力 −kx</SvgLabel>
            </>
          )}
          <SvgArrow x1={px} y1={cy - 26} x2={px} y2={cy - 86} color={RED} />
          <SvgLabel x={px} y={cy - 100} color={RED}>垂直抗力 N</SvgLabel>
          <SvgArrow x1={px} y1={cy + 26} x2={px} y2={cy + 86} color={RED} />
          <SvgLabel x={px} y={cy + 100} color={RED}>重力 mg</SvgLabel>
        </>
      )}

      {arrows.velocity && Math.abs(v) > 0.02 && (
        <>
          <SvgArrow
            x1={px}
            y1={cy + 36}
            x2={px + v * 80}
            y2={cy + 36}
            color={GREEN}
            width={2.0}
          />
          <SvgLabel x={px + v * 80 + Math.sign(v) * 22} y={cy + 36} color={GREEN}>速度 v</SvgLabel>
        </>
      )}
      {arrows.acceleration && Math.abs(a) > 0.02 && (
        <>
          <SvgArrow
            x1={px}
            y1={cy - 36}
            x2={px + a * 8}
            y2={cy - 36}
            color={AMBER}
            width={1.8}
          />
          <SvgLabel x={px + a * 8 + Math.sign(a) * 22} y={cy - 36} color={AMBER}>加速度 a</SvgLabel>
        </>
      )}
    </>
  );
}

function SpringPath({ x0, x1, cy }: { x0: number; x1: number; cy: number }) {
  const length = x1 - x0;
  if (length <= 20) {
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
    const px = alongX + (Math.sin(th) + 1) * skew;
    const py = cy - Math.cos(th) * radius;
    pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return <path d={pts.join(" ")} stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

// ==== scene: CIRCULAR =====================================================
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
  const Rpx = R * 340; // pixel radius in viewBox

  const cx = 250;
  const cy = 170;
  const theta = omega * t;

  const bx = cx + Rpx * Math.cos(theta);
  const by = cy + Rpx * Math.sin(theta);

  const v = Math.abs(omega) * R;
  const a = omega * omega * R;

  useSendTelemetry(onTelemetry, { t, speed: v, accel: a });

  // Tangent direction (perpendicular to radial, in direction of motion)
  const tan = { x: -Math.sin(theta), y: Math.cos(theta) };
  // Inward radial (toward center)
  const inward = { x: -Math.cos(theta), y: -Math.sin(theta) };

  return (
    <>
      <circle cx={cx} cy={cy} r={Rpx} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 5" fill="none" />
      <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.7)" />
      <text x={cx - 8} y={cy - 8} fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="end">O</text>

      {/* string */}
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" />

      <circle cx={bx} cy={by} r={22} fill="url(#simBlock)" filter="url(#simBlockShadow)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <circle cx={bx - 6} cy={by - 6} r={5} fill="rgba(255,255,255,0.2)" />
      <text x={bx} y={by + 5} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="14" fontStyle="italic" fontWeight={600} fontFamily="'Cambria Math','STIX Two Math','Times New Roman',serif">m</text>

      {arrows.force && (
        <>
          <SvgArrow x1={bx} y1={by} x2={bx + inward.x * 72} y2={by + inward.y * 72} color={RED} />
          <SvgLabel x={bx + inward.x * 88} y={by + inward.y * 88} color={RED}>張力 T（向心力）</SvgLabel>
        </>
      )}
      {arrows.velocity && (
        <>
          <SvgArrow x1={bx} y1={by} x2={bx + tan.x * (40 + v * 30)} y2={by + tan.y * (40 + v * 30)} color={GREEN} width={2.0} />
          <SvgLabel x={bx + tan.x * (40 + v * 30 + 18)} y={by + tan.y * (40 + v * 30 + 18)} color={GREEN}>速度 v</SvgLabel>
        </>
      )}
      {arrows.acceleration && (
        <>
          <SvgArrow
            x1={bx + tan.x * 4}
            y1={by + tan.y * 4}
            x2={bx + tan.x * 4 + inward.x * (28 + a * 16)}
            y2={by + tan.y * 4 + inward.y * (28 + a * 16)}
            color={AMBER}
            width={1.8}
          />
          <SvgLabel
            x={bx + tan.x * 4 + inward.x * (40 + a * 16)}
            y={by + tan.y * 4 + inward.y * (40 + a * 16) + 14}
            color={AMBER}
          >
            向心加速度 a
          </SvgLabel>
        </>
      )}
    </>
  );
}

// ==== scene: PROJECTILE ===================================================
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
  const angleDeg = params.launchAngle ?? 55;
  const rad = (angleDeg * Math.PI) / 180;

  // Physics in "sim units": x grows, y decays by 0.5 g t².
  const gSim = 1.4;
  const vx = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);
  // For horizontal launch (θ=0), launch from a cliff so motion is visible.
  const launchHeight = angleDeg <= 2 ? 0.55 : 0;

  const flightTime = angleDeg <= 2
    ? Math.sqrt((2 * launchHeight) / gSim)
    : (2 * vy0) / gSim;
  const cycleTime = Math.max(flightTime + 0.6, 1);

  const tt = t % cycleTime;
  const alive = tt <= flightTime;
  const x = vx * tt;
  const y = angleDeg <= 2
    ? launchHeight - 0.5 * gSim * tt * tt
    : vy0 * tt - 0.5 * gSim * tt * tt;
  const vyNow = angleDeg <= 2 ? -gSim * tt : vy0 - gSim * tt;

  // viewBox mapping
  const ORIGIN_X = angleDeg <= 2 ? 80 : 60;
  const ORIGIN_Y = angleDeg <= 2 ? 90 : 280;
  const SCALE = 130;

  const px = alive ? ORIGIN_X + x * SCALE : ORIGIN_X + vx * flightTime * SCALE;
  const py = alive ? ORIGIN_Y - y * SCALE : ORIGIN_Y - 0 * SCALE;

  const speed = Math.hypot(vx, vyNow);
  useSendTelemetry(onTelemetry, { t, speed, accel: gSim });

  // trajectory dotted path (full flight preview)
  const trajSamples = 40;
  const trajPts: string[] = [];
  for (let i = 0; i <= trajSamples; i++) {
    const tau = (i / trajSamples) * flightTime;
    const xi = vx * tau;
    const yi = angleDeg <= 2
      ? launchHeight - 0.5 * gSim * tau * tau
      : vy0 * tau - 0.5 * gSim * tau * tau;
    trajPts.push(`${ORIGIN_X + xi * SCALE},${ORIGIN_Y - yi * SCALE}`);
  }

  return (
    <>
      <rect x="0" y="280" width={VB_W} height={60} fill="url(#simHatch)" />
      <line x1="0" y1="280" x2={VB_W} y2="280" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

      {/* cliff for horizontal launch */}
      {angleDeg <= 2 && (
        <rect x="0" y={ORIGIN_Y} width={ORIGIN_X - 6} height={280 - ORIGIN_Y} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      )}

      {/* trajectory */}
      <polyline points={trajPts.join(" ")} fill="none" stroke="rgba(48,209,88,0.35)" strokeWidth="1.4" strokeDasharray="2 4" />

      {/* launch marker */}
      <circle cx={ORIGIN_X} cy={ORIGIN_Y} r={3} fill="rgba(255,255,255,0.7)" />

      {/* ball */}
      <circle cx={px} cy={py} r={14} fill="url(#simBlock)" filter="url(#simBlockShadow)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <circle cx={px - 3} cy={py - 3} r={4} fill="rgba(255,255,255,0.25)" />

      {arrows.force && (
        <>
          <SvgArrow x1={px} y1={py} x2={px} y2={py + 60} color={RED} />
          <SvgLabel x={px + 20} y={py + 72} color={RED}>重力 mg</SvgLabel>
        </>
      )}

      {arrows.velocity && (
        <>
          <SvgArrow
            x1={px}
            y1={py}
            x2={px + vx * 35}
            y2={py - vyNow * 35}
            color={GREEN}
            width={2.0}
          />
          <SvgLabel x={px + vx * 35 + Math.sign(vx) * 18} y={py - vyNow * 35 + (vyNow >= 0 ? -14 : 14)} color={GREEN}>速度 v</SvgLabel>

          {arrows.decomposition && (
            <>
              {/* v_x component */}
              <SvgArrow
                x1={px}
                y1={py}
                x2={px + vx * 35}
                y2={py}
                color={RED_LIGHT}
                dashed
                width={1.6}
              />
              <SvgLabel x={px + vx * 35 + 18} y={py} color={RED_LIGHT}>v₀ cosθ</SvgLabel>
              {/* v_y component */}
              <SvgArrow
                x1={px}
                y1={py}
                x2={px}
                y2={py - vyNow * 35}
                color={RED_LIGHT}
                dashed
                width={1.6}
              />
              <SvgLabel x={px - 20} y={py - vyNow * 35 + (vyNow >= 0 ? -14 : 14)} color={RED_LIGHT}>v_y</SvgLabel>
            </>
          )}
        </>
      )}

      {arrows.acceleration && (
        <>
          <SvgArrow x1={px - 20} y1={py} x2={px - 20} y2={py + 46} color={AMBER} width={1.7} />
          <SvgLabel x={px - 40} y={py + 26} color={AMBER}>加速度 g</SvgLabel>
        </>
      )}
    </>
  );
}

// ==== util: throttled telemetry =========================================
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
