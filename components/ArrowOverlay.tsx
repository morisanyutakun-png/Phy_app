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
import { useId, useMemo } from "react";

const ARROW_COLOR = ARROW_COLORS;

const JUDGMENT_STYLE: Record<ArrowJudgment, { stroke: string; dash?: string; opacity: number }> = {
  CORRECT: { stroke: "currentColor", opacity: 1 },
  UNNECESSARY: { stroke: "#94A3B8", opacity: 0.35, dash: "6 6" },
  WRONG_DIRECTION: { stroke: "#E0375C", opacity: 1, dash: "2 6" },
  USER_ADDED: { stroke: "currentColor", opacity: 1, dash: "4 3" },
};

interface DrawableArrow {
  id: string;
  type: ArrowType;
  label: string;
  from: Vec2;
  to: Vec2;
  judgment?: ArrowJudgment;
  isUserAdded?: boolean;
  isSelected?: boolean;
}

export interface ArrowOverlayProps {
  imageUrl: string;
  arrows: ArrowCandidate[];
  userArrows?: UserDrawnArrow[];
  judgments?: Record<string, ArrowJudgment | undefined>;
  selectedArrowId?: string | null;
  onSelect?: (id: string) => void;
  /** Called with normalized (0..1) coords when the user clicks empty canvas */
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
  const gid = useId().replace(/[:]/g, "");

  const drawables: DrawableArrow[] = useMemo(() => {
    const a: DrawableArrow[] = arrows.map((arr) => {
      const judgment = judgments[arr.id];
      // When user said "wrong direction" and an alternate is present, render the alternate flipped hint.
      if (judgment === "WRONG_DIRECTION" && arr.alternate) {
        return {
          id: arr.id,
          type: arr.type,
          label: arr.label,
          from: arr.alternate.from,
          to: arr.alternate.to,
          judgment,
          isSelected: selectedArrowId === arr.id,
        };
      }
      return {
        id: arr.id,
        type: arr.type,
        label: arr.label,
        from: arr.from,
        to: arr.to,
        judgment,
        isSelected: selectedArrowId === arr.id,
      };
    });
    const u: DrawableArrow[] = userArrows.map((ua) => ({
      id: ua.id,
      type: ua.type,
      label: ua.label,
      from: ua.from,
      to: ua.to,
      judgment: "USER_ADDED",
      isUserAdded: true,
      isSelected: selectedArrowId === ua.id,
    }));
    return [...a, ...u];
  }, [arrows, userArrows, judgments, selectedArrowId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCanvasClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onCanvasClick({ x, y });
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-ink-soft/5 border border-ink/10 select-none",
        className
      )}
      onClick={handleCanvasClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="解析対象の問題図"
        className="block w-full h-auto"
        draggable={false}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {(["force", "velocity", "acceleration"] as ArrowType[]).map((t) => (
            <marker
              key={t}
              id={`head-${gid}-${t}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill={ARROW_COLOR[t]} />
            </marker>
          ))}
          <marker
            id={`head-${gid}-muted`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#94A3B8" />
          </marker>
        </defs>

        {drawables.map((d) => {
          const judgment = d.judgment ?? "CORRECT";
          const style = JUDGMENT_STYLE[judgment];
          const color =
            judgment === "UNNECESSARY"
              ? "#94A3B8"
              : judgment === "WRONG_DIRECTION"
                ? "#E0375C"
                : ARROW_COLOR[d.type];
          const marker =
            judgment === "UNNECESSARY"
              ? `url(#head-${gid}-muted)`
              : `url(#head-${gid}-${d.type})`;

          const x1 = d.from.x * 100;
          const y1 = d.from.y * 100;
          const x2 = d.to.x * 100;
          const y2 = d.to.y * 100;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g
              key={d.id}
              style={{ pointerEvents: "auto", cursor: "pointer", color }}
              opacity={style.opacity}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(d.id);
              }}
            >
              {/* hit area */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={6}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={d.isSelected ? 3.2 : 2.2}
                strokeDasharray={style.dash}
                markerEnd={marker}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
              {d.isSelected && (
                <circle
                  cx={x1}
                  cy={y1}
                  r={1.2}
                  fill={color}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x={-0.3}
                  y={-3.2}
                  width={Math.min(18, d.label.length * 1.8 + 4)}
                  height={4}
                  rx={1}
                  fill="white"
                  opacity={0.9}
                  stroke={color}
                  strokeWidth={0.2}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={1}
                  y={-0.4}
                  fontSize={2.4}
                  fill={color}
                  fontWeight={600}
                  style={{ fontFamily: "inherit" }}
                >
                  {d.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { ARROW_COLORS as ARROW_TYPE_COLORS };
