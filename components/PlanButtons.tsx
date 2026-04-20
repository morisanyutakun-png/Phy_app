"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Stripeセッションを作成できませんでした");
      }
      window.location.href = data.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラーが発生しました");
      setBusy(false);
    }
  }
  return (
    <div className="w-full">
      <button className="btn-primary w-full" disabled={busy} onClick={go}>
        {busy ? "遷移中…" : "Pro にアップグレード"}
      </button>
      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
    </div>
  );
}

export function ManagePlanButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "ポータルを開けませんでした");
      }
      window.location.href = data.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "エラーが発生しました");
      setBusy(false);
    }
  }
  return (
    <div className="w-full">
      <button className="btn-secondary w-full" disabled={busy} onClick={go}>
        {busy ? "遷移中…" : "プランを管理する"}
      </button>
      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
    </div>
  );
}
