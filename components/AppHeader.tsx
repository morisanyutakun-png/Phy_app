import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export interface AppHeaderProps {
  email: string;
  plan: "FREE" | "PRO";
  used: number;
  limit: number;
}

export function AppHeader({ email, plan, used, limit }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-ink/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-5">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard">ダッシュボード</NavLink>
            <NavLink href="/upload">解析する</NavLink>
            <NavLink href="/history">履歴</NavLink>
            <NavLink href="/pricing">料金</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-ink-muted">
            本日 {used}/{limit} 回
          </div>
          <span
            className={
              plan === "PRO"
                ? "chip bg-brand text-white"
                : "chip bg-ink/5 text-ink"
            }
          >
            {plan}
          </span>
          <div className="hidden md:block text-sm text-ink-muted max-w-[180px] truncate">
            {email}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink rounded-lg hover:bg-ink/5"
    >
      {children}
    </Link>
  );
}
