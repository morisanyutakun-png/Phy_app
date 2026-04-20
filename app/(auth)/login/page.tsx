"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "ログインに失敗しました");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ログインに失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-7">
      <h1 className="text-xl font-bold text-ink">ログイン</h1>
      <p className="text-sm text-ink-muted mt-1">
        メールアドレスとパスワードでログイン
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
          <label className="label">パスワード</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
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
          {busy ? "ログイン中…" : "ログイン"}
        </button>
      </form>
      <div className="mt-5 text-sm text-ink-muted">
        アカウントをお持ちでない方は{" "}
        <Link className="text-brand font-medium" href="/register">
          新規登録
        </Link>
      </div>
    </div>
  );
}
