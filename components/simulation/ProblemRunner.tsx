"use client";

import { useState } from "react";
import type { Problem, SimParams, ArrowToggles } from "@/lib/problems";
import { PhysicsSimulation, type Telemetry } from "./PhysicsSimulation";
import { SimulationControls, ArrowToggleBar } from "./SimulationControls";

export function ProblemRunner({ problem }: { problem: Problem }) {
  const [params, setParams] = useState<SimParams>(problem.simulation.params);
  const [arrows, setArrows] = useState<ArrowToggles>(problem.simulation.arrows);
  const [paused, setPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-3">
        <PhysicsSimulation
          type={problem.simulation.type}
          params={params}
          arrows={arrows}
          paused={paused}
          resetKey={resetKey}
          onTelemetry={setTelemetry}
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ArrowToggleBar arrows={arrows} onChange={setArrows} />
          <div className="text-[11px] text-ink-muted">
            リアルタイム解析 · パラメータを変えると矢印も追従
          </div>
        </div>
      </div>

      <SimulationControls
        params={params}
        controllable={problem.simulation.controllable}
        onChange={(p) => {
          setParams(p);
          // Bump resetKey when params change so the motion restarts cleanly
          // with the new values (otherwise the block teleports mid-slide).
          setResetKey((k) => k + 1);
        }}
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        onReset={() => setResetKey((k) => k + 1)}
        telemetry={telemetry ? { speed: telemetry.speed, accel: telemetry.accel } : null}
      />
    </div>
  );
}
