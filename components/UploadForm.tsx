"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function UploadForm({
  canAnalyze,
  plan,
}: {
  canAnalyze: boolean;
  plan: "FREE" | "PRO";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    setErr(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      setPhase("画像をアップロード中…");
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok) throw new Error(upData.error ?? "アップロードに失敗しました");

      setPhase("AIが矢印候補を解析しています…");
      const an = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uploadId: upData.uploadId }),
      });
      const anData = await an.json().catch(() => ({}));
      if (!an.ok) {
        if (anData.code === "LIMIT_REACHED") {
          router.push("/pricing?reason=limit");
          return;
        }
        throw new Error(anData.error ?? "解析に失敗しました");
      }
      router.push(`/analysis/${anData.analysisId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setBusy(false);
      setPhase("");
    }
  }

  return (
    <div>
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition",
          dragOver
            ? "border-brand bg-brand-light"
            : "border-ink/15 bg-white hover:bg-ink/5 cursor-pointer"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0] ?? null;
          pickFile(f);
        }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="プレビュー"
            className="mx-auto max-h-80 rounded-xl"
          />
        ) : (
          <div className="py-6">
            <div className="text-sm font-semibold text-ink">
              ファイルをドラッグ&ドロップ
            </div>
            <div className="text-xs text-ink-muted mt-1">
              またはクリックして選択（PNG / JPEG / WEBP, 最大 8MB）
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {!canAnalyze && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 px-3 py-2.5">
          本日の無料解析回数を使い切りました。Proにアップグレードすると上限が大きく広がります。
        </div>
      )}

      {err && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 px-3 py-2.5">
          {err}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-ink-muted">
          {plan === "FREE" ? "無料プラン（1日3問まで）" : "Proプラン"}
        </div>
        <button
          className="btn-primary"
          disabled={!file || busy || !canAnalyze}
          onClick={submit}
        >
          {busy ? phase || "解析中…" : "解析する"}
        </button>
      </div>
    </div>
  );
}
