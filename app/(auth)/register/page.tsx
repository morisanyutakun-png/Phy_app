"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthErr = params.get("error");
    if (oauthErr) setErr(oauthErr);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "登録に失敗しました");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "登録に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-7">
      <h1 className="text-xl font-bold text-ink">新規登録</h1>
      <p className="text-sm text-ink-muted mt-1">
        無料で始められます。クレジットカードは不要です。
      </p>
      <a
        href="/api/auth/google/start"
        className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 transition"
      >
        <GoogleGlyph />
        Googleで登録
      </a>
      <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
        <div className="flex-1 h-px bg-ink/10" />
        または
        <div className="flex-1 h-px bg-ink/10" />
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label">メールアドレス</label>
          <input
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">パスワード (8文字以上)</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && (
          <div className="rounded-xl bg-rose-50 text-rose-700 text-sm px-3 py-2 border border-rose-200">
            {err}
          </div>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "登録中…" : "無料で登録する"}
        </button>
      </form>
      <div className="mt-5 text-sm text-ink-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link className="text-brand font-medium" href="/login">
          ログイン
        </Link>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
