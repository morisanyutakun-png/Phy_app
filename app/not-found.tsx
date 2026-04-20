import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F7F8FB] px-5">
      <div className="text-center max-w-md">
        <div className="text-6xl">🧭</div>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          ページが見つかりません
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          URLを確認するか、トップへ戻ってください。
        </p>
        <Link href="/" className="btn-primary mt-6">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
