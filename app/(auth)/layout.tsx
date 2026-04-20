import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#F7F8FB_0%,#EDF1FF_100%)] flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-5 pt-6 flex items-center justify-between">
        <Logo />
        <Link href="/" className="btn-ghost text-sm">
          トップへ戻る
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
