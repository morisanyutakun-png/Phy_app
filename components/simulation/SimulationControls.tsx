"use client";

import { useState } from "react";
import type { ControllableParam, SimParams } from "@/lib/problems";
import { cn } from "@/lib/cn";

interface Props {
  params: SimParams;
  controllable: ControllableParam[];
  onChange: (params: SimParams) => void;
  paused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  telemetry?: {
    speed: number;
    accel: number;
  } | null;
}

export function SimulationControls({
  params,
  controllable,
  onChange,
  paused,
  onTogglePause,
  onReset,
  telemetry,
}: Props) {
  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className={cn(
            "flex-1 btn text-sm font-semibold",
            paused ? "bg-brand text-white hover:bg-brand-dark" : "bg-ink text-white hover:bg-ink/90"
          )}
        >
          {paused ? "▶ 再生" : "❚❚ 一時停止"}
        </button>
        <button onClick={onReset} className="btn btn-secondary text-sm">
          ↺ リセット
        </button>
      </div>

      {controllable.length > 0 && (
        <div className="space-y-3">
          {controllable.map((c) => (
            <Slider
              key={c.key as string}
              spec={c}
              value={(params[c.key] as number | undefined) ?? c.min}
              onChange={(v) => onChange({ ...params, [c.key]: v })}
            />
          ))}
        </div>
      )}

      {telemetry && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-ink/5">
          <Readout label="速度" value={telemetry.speed} unit="m/s" color="#30D158" />
          <Readout label="加速度" value={telemetry.accel} unit="m/s²" color="#FF9F0A" />
        </div>
      )}
    </div>
  );
}

function Slider({
  spec,
  value,
  onChange,
}: {
  spec: ControllableParam;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-ink-muted">{spec.label}</span>
        <span className="text-xs font-mono text-ink tabular-nums">
          {value.toFixed(spec.step < 1 ? 2 : 0)}
          {spec.unit && <span className="text-ink-muted ml-0.5">{spec.unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
    </label>
  );
}

function Readout({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  // value comes from the sim renderer — it may be in sim units that don't
  // map cleanly to real m/s. We show it as an indicator that grows/shrinks
  // rather than a calibrated physical quantity.
  const magnitude = Math.abs(value);
  const pct = Math.min(100, magnitude * 20);
  return (
    <div className="rounded-lg bg-ink/5 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink-muted">{label}</span>
        <span className="text-[11px] font-mono tabular-nums" style={{ color }}>
          {magnitude.toFixed(2)} <span className="opacity-60">{unit}</span>
        </span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-ink/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function ArrowToggleBar({
  arrows,
  onChange,
}: {
  arrows: { force?: boolean; velocity?: boolean; acceleration?: boolean; decomposition?: boolean };
  onChange: (next: typeof arrows) => void;
}) {
  const items: Array<{ key: keyof typeof arrows; label: string; color: string }> = [
    { key: "force", label: "力", color: "#FF375F" },
    { key: "velocity", label: "速度", color: "#30D158" },
    { key: "acceleration", label: "加速度", color: "#FF9F0A" },
    { key: "decomposition", label: "分解", color: "#FFA0B5" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = Boolean(arrows[it.key]);
        return (
          <button
            key={it.key}
            onClick={() => onChange({ ...arrows, [it.key]: !active })}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
              active ? "bg-white border-transparent shadow-sm" : "bg-white/60 border-ink/10 text-ink-muted hover:bg-white"
            )}
            style={active ? { color: it.color, borderColor: it.color } : undefined}
          >
            <span
              className="inline-block rounded-full"
              style={{ width: 6, height: 6, background: it.color, boxShadow: active ? `0 0 6px ${it.color}` : "none" }}
            />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
