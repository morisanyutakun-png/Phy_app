"use client";

import { cn } from "@/lib/cn";
import { ARROW_COLORS } from "@/lib/arrow-colors";
import type {
  ArrowCandidate,
  ArrowJudgment,
  ArrowType,
  UserDrawnArrow,
  Vec2,
} from "@/types/analysis";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const JUDGMENT_STYLE: Record<
  ArrowJudgment,
  { opacity: number; dash?: string; colorOverride?: string }
> = {
  CORRECT: { opacity: 1 },
  UNNECESSARY: { opacity: 0.3, dash: "6 5", colorOverride: "#94A3B8" },
  WRONG_DIRECTION: { opacity: 1, dash: "3 5", colorOverride: "#E0375C" },
  USER_ADDED: { opacity: 1, dash: "5 3" },
};

const TYPE_LABEL_JA: Record<ArrowType, string> = {
  force: "力",
  velocity: "速度",
  acceleration: "加速度",
};

interface DrawableArrow {
  id: string;
  type: ArrowType;
  label: string;
  from: Vec2;
  to: Vec2;
  judgment: ArrowJudgment;
  isSelected: boolean;
  isComponent?: boolean;
}

export interface ArrowOverlayProps {
  imageUrl: string;
  arrows: ArrowCandidate[];
  userArrows?: UserDrawnArrow[];
  judgments?: Record<string, ArrowJudgment | undefined>;
  selectedArrowId?: string | null;
  onSelect?: (id: string) => void;
  onCanvasClick?: (pt: Vec2) => void;
  className?: string;
}

export function ArrowOverlay({
  imageUrl,
  arrows,
  userArrows = [],
  judgments = {},
  selectedArrowId,
  onSelect,
  onCanvasClick,
  className,
}: ArrowOverlayProps) {
  const gid = useId().replace(/:/g, "");
  const imgRef = useRef<HTMLImageElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const update = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setNat({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    update();
    img.addEventListener("load", update);
    return () => img.removeEventListener("load", update);
  }, [imageUrl]);

  const drawables: DrawableArrow[] = useMemo(() => {
    const a: DrawableArrow[] = arrows.map((arr) => {
      const judgment: ArrowJudgment = judgments[arr.id] ?? "CORRECT";
      const useAlt = judgment === "WRONG_DIRECTION" && arr.alternate;
      return {
        id: arr.id,
        type: arr.type,
        label: arr.label,
        from: useAlt ? arr.alternate!.from : arr.from,
        to: useAlt ? arr.alternate!.to : arr.to,
        judgment,
        isSelected: selectedArrowId === arr.id,
        isComponent: arr.isComponent,
      };
    });
    const u: DrawableArrow[] = userArrows.map((ua) => ({
      id: ua.id,
      type: ua.type,
      label: ua.label,
      from: ua.from,
      to: ua.to,
      judgment: "USER_ADDED",
      isSelected: selectedArrowId === ua.id,
    }));
    return [...a, ...u];
  }, [arrows, userArrows, judgments, selectedArrowId]);

  const labels = useMemo(
    () => placeLabels(drawables),
    [drawables]
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCanvasClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onCanvasClick({ x, y });
  };

  // Display space is normalized viewBox 0..1 scaled to image natural size.
  const W = nat?.w ?? 800;
  const H = nat?.h ?? 600;
  // Scale factor used for stroke / marker sizing so visuals look consistent
  // across wildly different image resolutions.
  const unit = Math.min(W, H) / 100;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-white border border-ink/10 select-none",
        className
      )}
      onClick={handleCanvasClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="解析対象の問題図"
        className="block w-full h-auto"
        draggable={false}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {(["force", "velocity", "acceleration"] as ArrowType[]).map((t) => (
            <marker
              key={t}
              id={`head-${gid}-${t}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth={unit * 3.8}
              markerHeight={unit * 3.8}
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,1 L10,5 L0,9 z" fill={ARROW_COLORS[t]} />
            </marker>
          ))}
          <marker
            id={`head-${gid}-muted`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth={unit * 3.2}
            markerHeight={unit * 3.2}
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,1 L10,5 L0,9 z" fill="#94A3B8" />
          </marker>
          <marker
            id={`head-${gid}-wrong`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth={unit * 3.8}
            markerHeight={unit * 3.8}
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,1 L10,5 L0,9 z" fill="#E0375C" />
          </marker>
        </defs>

        {drawables.map((d) => {
          const style = JUDGMENT_STYLE[d.judgment];
          const color = style.colorOverride ?? ARROW_COLORS[d.type];
          const markerId =
            d.judgment === "UNNECESSARY"
              ? `head-${gid}-muted`
              : d.judgment === "WRONG_DIRECTION"
                ? `head-${gid}-wrong`
                : `head-${gid}-${d.type}`;

          const x1 = d.from.x * W;
          const y1 = d.from.y * H;
          const x2 = d.to.x * W;
          const y2 = d.to.y * H;

          const strokeWidth = (d.isSelected ? 3.5 : 2.6) * (unit / 3.5);

          return (
            <g
              key={d.id}
              style={{ pointerEvents: "auto", cursor: "pointer" }}
              opacity={style.opacity}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(d.id);
              }}
            >
              {/* widened hit area */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={14 * (unit / 3.5)}
                strokeLinecap="round"
              />
              {/* glow when selected */}
              {d.isSelected && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeOpacity={0.25}
                  strokeWidth={strokeWidth * 3}
                  strokeLinecap="round"
                />
              )}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={d.isComponent ? strokeWidth * 0.78 : strokeWidth}
                strokeOpacity={d.isComponent ? 0.85 : 1}
                strokeDasharray={(() => {
                  // Judgment-driven dashes (wrong direction, unnecessary,
                  // user added) take priority over the component-dash style.
                  if (style.dash) {
                    return style.dash
                      .split(" ")
                      .map((n) => Number(n) * (unit / 3.5))
                      .join(" ");
                  }
                  if (d.isComponent) {
                    // Dashed stroke: signals "this is a decomposition, not
                    // an independent force."
                    return `${5 * (unit / 3.5)} ${3 * (unit / 3.5)}`;
                  }
                  return undefined;
                })()}
                markerEnd={`url(#${markerId})`}
                strokeLinecap="round"
              />
              {/* origin dot at the tail */}
              <circle
                cx={x1}
                cy={y1}
                r={Math.max(2, unit * 0.7)}
                fill={color}
                opacity={0.85}
              />
            </g>
          );
        })}
      </svg>

      {/* HTML labels — crisp, not distorted by aspect ratio */}
      <div className="absolute inset-0 pointer-events-none">
        {labels.map((l) => {
          const color = l.colorOverride ?? ARROW_COLORS[l.type];
          return (
            <button
              key={l.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(l.id);
              }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2",
                "pointer-events-auto rounded-md px-1.5 py-0.5",
                "text-[11px] md:text-xs font-semibold leading-none",
                "border bg-white/95 backdrop-blur-sm shadow-sm",
                "hover:bg-white transition",
                l.isSelected && "ring-2 ring-offset-1"
              )}
              style={{
                left: `${l.x * 100}%`,
                top: `${l.y * 100}%`,
                color,
                borderColor: color,
                opacity: l.opacity,
              }}
              title={`${l.label}（${TYPE_LABEL_JA[l.type]}）`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ARROW_COLORS as ARROW_TYPE_COLORS };

/* ---------- label placement ---------- */

interface PlacedLabel {
  id: string;
  label: string;
  type: ArrowType;
  x: number;
  y: number;
  opacity: number;
  isSelected: boolean;
  colorOverride?: string;
}

/**
 * Place labels near the TIP of each arrow, offset perpendicular to the line.
 * When two labels land close together, nudge them apart radially around the
 * arrow's anchor so they don't stack on top of each other.
 */
function placeLabels(arrows: DrawableArrow[]): PlacedLabel[] {
  const placed: PlacedLabel[] = [];

  for (const a of arrows) {
    const dx = a.to.x - a.from.x;
    const dy = a.to.y - a.from.y;
    const len = Math.hypot(dx, dy) || 1e-6;
    const nx = dx / len;
    const ny = dy / len;

    // Base anchor: slightly past the tip, along the arrow direction.
    const alongTip = 0.04; // how far past the tip, normalized
    let bx = a.to.x + nx * alongTip;
    let by = a.to.y + ny * alongTip;

    // Keep labels inside the figure
    bx = clamp(bx, 0.04, 0.96);
    by = clamp(by, 0.04, 0.96);

    const style = JUDGMENT_STYLE[a.judgment];
    placed.push({
      id: a.id,
      label: a.label,
      type: a.type,
      x: bx,
      y: by,
      opacity: style.opacity,
      isSelected: a.isSelected,
      colorOverride: style.colorOverride,
    });
  }

  // Resolve collisions: if two labels are within MIN distance, push them
  // apart perpendicular to the line connecting them.
  const MIN = 0.09;
  for (let iter = 0; iter < 6; iter++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < MIN) {
          const need = (MIN - d) / 2 + 0.005;
          if (d < 1e-4) {
            // identical positions: randomize direction so later iterations
            // can spread them out
            const ang = (i * 137.5 * Math.PI) / 180;
            dx = Math.cos(ang);
            dy = Math.sin(ang);
          } else {
            dx /= d;
            dy /= d;
          }
          a.x = clamp(a.x - dx * need, 0.04, 0.96);
          a.y = clamp(a.y - dy * need, 0.04, 0.96);
          b.x = clamp(b.x + dx * need, 0.04, 0.96);
          b.y = clamp(b.y + dy * need, 0.04, 0.96);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  return placed;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
