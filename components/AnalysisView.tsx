"use client";

import { ArrowOverlay, ARROW_TYPE_COLORS } from "@/components/ArrowOverlay";
import { MISCONCEPTIONS } from "@/lib/misconceptions";
import type {
  AnalysisResult,
  ArrowCandidate,
  ArrowJudgment,
  ArrowType,
  MisconceptionTag,
  UserDrawnArrow,
  Vec2,
} from "@/types/analysis";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  analysisId: string;
  imageUrl: string;
  result: AnalysisResult;
}

const TYPE_LABEL: Record<ArrowType, string> = {
  force: "力",
  velocity: "速度",
  acceleration: "加速度",
};

const UNIT_LABEL: Record<string, string> = {
  HORIZONTAL: "水平面",
  INCLINE: "斜面",
  SPRING: "ばね",
  CIRCULAR: "円運動",
  PROJECTILE: "投射",
  UNKNOWN: "判定中",
};

type JudgmentMap = Record<string, ArrowJudgment | undefined>;

interface DraftAdd {
  type: ArrowType;
  label: string;
  from?: Vec2;
  to?: Vec2;
}

export function AnalysisView({ analysisId, imageUrl, result }: Props) {
  const [judgments, setJudgments] = useState<JudgmentMap>({});
  const [userArrows, setUserArrows] = useState<UserDrawnArrow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    result.arrows[0]?.id ?? null
  );
  const [addMode, setAddMode] = useState<DraftAdd | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"arrows" | "formula">("arrows");

  const selectedArrow: ArrowCandidate | undefined = useMemo(
    () => result.arrows.find((a) => a.id === selectedId),
    [result.arrows, selectedId]
  );

  const selectedUserArrow = userArrows.find((u) => u.id === selectedId);

  const derivedMistakeTags: MisconceptionTag[] = useMemo(() => {
    const s = new Set<MisconceptionTag>();
    for (const arrow of result.arrows) {
      const j = judgments[arrow.id];
      if (j === "WRONG_DIRECTION" || j === "UNNECESSARY") {
        arrow.commonMistakes?.forEach((t) => s.add(t));
      }
    }
    return Array.from(s);
  }, [judgments, result.arrows]);

  const coachingByTag = useMemo(
    () => new Map(result.coachingNotes.map((c) => [c.tag, c.note])),
    [result.coachingNotes]
  );

  function judge(arrowId: string, judgment: ArrowJudgment) {
    setJudgments((prev) => ({
      ...prev,
      [arrowId]: prev[arrowId] === judgment ? undefined : judgment,
    }));
  }

  function handleCanvasClick(pt: Vec2) {
    if (!addMode) return;
    if (!addMode.from) {
      setAddMode({ ...addMode, from: pt });
      return;
    }
    if (!addMode.to) {
      const finalized: UserDrawnArrow = {
        id: `user-${Date.now()}`,
        objectId: null,
        type: addMode.type,
        label: addMode.label,
        from: addMode.from,
        to: pt,
      };
      setUserArrows((prev) => [...prev, finalized]);
      setAddMode(null);
      setSelectedId(finalized.id);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSavedMsg(null);
    try {
      const judgmentList = Object.entries(judgments)
        .filter(([, v]) => v === "CORRECT" || v === "UNNECESSARY" || v === "WRONG_DIRECTION")
        .map(([arrowId, j]) => ({
          arrowId,
          arrowLabel:
            result.arrows.find((a) => a.id === arrowId)?.label ?? arrowId,
          judgment: j as "CORRECT" | "UNNECESSARY" | "WRONG_DIRECTION",
        }));

      const userAdded = userArrows.map((u) => ({
        arrowId: u.id,
        arrowLabel: u.label,
        data: {
          type: u.type,
          from: u.from,
          to: u.to,
          objectId: u.objectId,
        },
      }));

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          analysisId,
          judgments: judgmentList,
          userAdded,
        }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setSavedMsg("保存しました。苦手分析に反映されます。");
    } catch (err) {
      setSavedMsg(
        err instanceof Error ? err.message : "保存中にエラーが発生しました"
      );
    } finally {
      setSaving(false);
    }
  }

  const hintText = addMode
    ? !addMode.from
      ? "矢印の始点をクリック"
      : !addMode.to
        ? "矢印の終点をクリック"
        : ""
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
      {/* Left: figure */}
      <div className="card p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="chip bg-brand-light text-brand-dark">
              {UNIT_LABEL[result.unit] ?? result.unit}
            </span>
            {result.title && (
              <h2 className="text-base font-semibold text-ink">
                {result.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <LegendDot color={ARROW_TYPE_COLORS.force} label="力" />
            <LegendDot color={ARROW_TYPE_COLORS.velocity} label="速度" />
            <LegendDot color={ARROW_TYPE_COLORS.acceleration} label="加速度" />
          </div>
        </div>

        <ArrowOverlay
          imageUrl={imageUrl}
          arrows={result.arrows}
          userArrows={userArrows}
          judgments={judgments}
          selectedArrowId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onCanvasClick={handleCanvasClick}
          className={cn(addMode && "ring-2 ring-brand/50 cursor-crosshair")}
        />

        {result.summary && (
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">
            {result.summary}
          </p>
        )}

        {addMode && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-light/60 border border-brand/30 px-3 py-2">
            <div className="text-sm text-brand-dark">
              <strong>矢印を追加中：</strong> {TYPE_LABEL[addMode.type]}「
              {addMode.label}」 — {hintText}
            </div>
            <button
              className="btn-ghost text-xs"
              onClick={() => setAddMode(null)}
            >
              キャンセル
            </button>
          </div>
        )}
      </div>

      {/* Right: side panel */}
      <div className="flex flex-col gap-4">
        <div className="card p-1">
          <div className="flex">
            <TabButton active={tab === "arrows"} onClick={() => setTab("arrows")}>
              矢印を確かめる
            </TabButton>
            <TabButton active={tab === "formula"} onClick={() => setTab("formula")}>
              立式につなげる
            </TabButton>
          </div>
        </div>

        {tab === "arrows" && (
          <>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink">
                  矢印候補 ({result.arrows.length})
                </h3>
                <AddMenu
                  onPick={(type, label) =>
                    setAddMode({ type, label, from: undefined, to: undefined })
                  }
                />
              </div>
              <ul className="flex flex-col gap-2">
                {result.arrows.map((a) => (
                  <ArrowRow
                    key={a.id}
                    arrow={a}
                    selected={selectedId === a.id}
                    judgment={judgments[a.id]}
                    onSelect={() => setSelectedId(a.id)}
                    onJudge={(j) => judge(a.id, j)}
                  />
                ))}
                {userArrows.length > 0 && (
                  <li className="text-xs text-ink-muted mt-3 mb-1">
                    追加した矢印
                  </li>
                )}
                {userArrows.map((u) => (
                  <li
                    key={u.id}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 flex items-center justify-between cursor-pointer",
                      selectedId === u.id
                        ? "border-brand bg-brand-light/40"
                        : "border-ink/10 bg-white hover:bg-ink/5"
                    )}
                    onClick={() => setSelectedId(u.id)}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: ARROW_TYPE_COLORS[u.type] }}
                      />
                      <span className="font-medium text-ink">{u.label}</span>
                      <span className="text-xs text-ink-muted">
                        ({TYPE_LABEL[u.type]}・自分で追加)
                      </span>
                    </div>
                    <button
                      className="text-xs text-ink-muted hover:text-arrow-force"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserArrows((prev) =>
                          prev.filter((x) => x.id !== u.id)
                        );
                        if (selectedId === u.id) setSelectedId(null);
                      }}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedArrow && (
              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: ARROW_TYPE_COLORS[selectedArrow.type] }}
                  />
                  <h4 className="text-sm font-semibold text-ink">
                    {selectedArrow.label}
                  </h4>
                  <span className="ml-auto text-xs text-ink-muted">
                    confidence {Math.round(selectedArrow.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-ink leading-relaxed">
                  {selectedArrow.reason}
                </p>
                {selectedArrow.commonMistakes?.length ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 leading-relaxed">
                    <div className="font-semibold mb-0.5">よくある誤解</div>
                    {selectedArrow.commonMistakes.map((t) => (
                      <div key={t}>・{MISCONCEPTIONS[t]?.short ?? t}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {selectedUserArrow && (
              <div className="card p-4">
                <h4 className="text-sm font-semibold text-ink mb-2">
                  追加した矢印：{selectedUserArrow.label}
                </h4>
                <p className="text-xs text-ink-muted">
                  あなたが「足りない」と判断して追加した矢印です。保存すると苦手分析の材料になります。
                </p>
              </div>
            )}

            {derivedMistakeTags.length > 0 && (
              <div className="card p-4 space-y-3">
                <h4 className="text-sm font-semibold text-ink">
                  誤解訂正フィードバック
                </h4>
                {derivedMistakeTags.map((tag) => {
                  const info = MISCONCEPTIONS[tag];
                  const extra = coachingByTag.get(tag);
                  if (!info) return null;
                  return (
                    <div
                      key={tag}
                      className="rounded-xl bg-rose-50/70 border border-rose-200 px-3 py-3"
                    >
                      <div className="text-sm font-semibold text-rose-900">
                        {info.label}
                      </div>
                      <p className="text-sm text-rose-900/90 mt-1 leading-relaxed">
                        {extra ?? info.short}
                      </p>
                      <details className="mt-2 text-xs text-rose-900/80">
                        <summary className="cursor-pointer">
                          もう少し詳しく
                        </summary>
                        <p className="mt-1 leading-relaxed">{info.deep}</p>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}

            {analysisId !== "demo" && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-ink-muted">
                  {savedMsg ?? "判定は『保存』で履歴に記録されます"}
                </div>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "保存中…" : "保存して履歴に残す"}
                </button>
              </div>
            )}
            {analysisId === "demo" && (
              <div className="text-xs text-ink-muted text-center">
                デモモードでは保存されません。登録すると履歴と苦手分析に反映されます。
              </div>
            )}
          </>
        )}

        {tab === "formula" && (
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-ink">
              次のステップ：式を立てる
            </h3>
            {result.formulaHints.length === 0 ? (
              <p className="text-sm text-ink-muted">
                立式のヒントはまだ生成されていません。矢印を先に確かめましょう。
              </p>
            ) : (
              result.formulaHints.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-ink/10 px-3 py-3 bg-white"
                >
                  <div className="text-sm font-semibold text-ink">{h.title}</div>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    {h.description}
                  </p>
                  {h.expression && (
                    <pre className="mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink overflow-x-auto">
                      {h.expression}
                    </pre>
                  )}
                </div>
              ))
            )}
            <p className="text-xs text-ink-muted leading-relaxed">
              ※ Arrow Physics は答えを全て出すアプリではありません。図から式への橋渡しに集中し、最後の計算は自分で手を動かすことを勧めます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ background: color }}
      />
      <span>{label}</span>
    </span>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex-1 text-sm font-semibold py-2 rounded-xl transition",
        active ? "bg-ink text-white" : "text-ink-muted hover:bg-ink/5"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ArrowRow({
  arrow,
  selected,
  judgment,
  onSelect,
  onJudge,
}: {
  arrow: ArrowCandidate;
  selected: boolean;
  judgment: ArrowJudgment | undefined;
  onSelect: () => void;
  onJudge: (j: ArrowJudgment) => void;
}) {
  return (
    <li
      className={cn(
        "rounded-xl border px-3 py-2.5 cursor-pointer transition",
        selected
          ? "border-brand bg-brand-light/40"
          : "border-ink/10 bg-white hover:bg-ink/5"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: ARROW_TYPE_COLORS[arrow.type] }}
        />
        <span className="text-sm font-medium text-ink">{arrow.label}</span>
        <span className="ml-auto text-[10px] text-ink-muted">
          {TYPE_LABEL[arrow.type]}
        </span>
      </div>
      <div
        className="mt-2 grid grid-cols-3 gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <JudgeChip
          label="正しい"
          active={judgment === "CORRECT"}
          color="emerald"
          onClick={() => onJudge("CORRECT")}
        />
        <JudgeChip
          label="不要"
          active={judgment === "UNNECESSARY"}
          color="slate"
          onClick={() => onJudge("UNNECESSARY")}
        />
        <JudgeChip
          label="向き違い"
          active={judgment === "WRONG_DIRECTION"}
          color="rose"
          onClick={() => onJudge("WRONG_DIRECTION")}
        />
      </div>
    </li>
  );
}

function JudgeChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: "emerald" | "slate" | "rose";
  onClick: () => void;
}) {
  const palette = {
    emerald: {
      on: "bg-emerald-600 text-white border-emerald-600",
      off: "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    },
    slate: {
      on: "bg-slate-700 text-white border-slate-700",
      off: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
    },
    rose: {
      on: "bg-rose-600 text-white border-rose-600",
      off: "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",
    },
  }[color];

  return (
    <button
      className={cn(
        "text-xs font-semibold rounded-lg border px-2 py-1.5 transition",
        active ? palette.on : palette.off
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function AddMenu({
  onPick,
}: {
  onPick: (type: ArrowType, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const items: Array<{ type: ArrowType; label: string }> = [
    { type: "force", label: "力（追加）" },
    { type: "velocity", label: "速度（追加）" },
    { type: "acceleration", label: "加速度（追加）" },
  ];
  return (
    <div className="relative">
      <button
        className="btn-secondary text-xs px-3 py-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        ＋ 足りない矢印を描く
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-10 w-44 rounded-xl bg-white border border-ink/10 shadow-card p-1">
          {items.map((it) => (
            <button
              key={it.type}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-ink/5 flex items-center gap-2"
              onClick={() => {
                onPick(it.type, it.label);
                setOpen(false);
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: ARROW_TYPE_COLORS[it.type] }}
              />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
