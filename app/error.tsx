"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F7F8FB] px-5">
      <div className="text-center max-w-md">
        <div className="text-6xl">⚠️</div>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          エラーが発生しました
        </h1>
        <p className="mt-2 text-sm text-ink-muted break-words">
          {error.message || "予期しないエラーが発生しました"}
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <button className="btn-secondary" onClick={reset}>
            もう一度試す
          </button>
          <Link href="/" className="btn-primary">
            トップへ
          </Link>
        </div>
      </div>
    </div>
  );
}
