import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <Link href="/" className="inline-flex items-center gap-2 select-none">
      <svg width="22" height="22" viewBox="0 0 24 24" className="text-brand">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B5BFF" />
            <stop offset="100%" stopColor="#22B07D" />
          </linearGradient>
        </defs>
        <path
          d="M4 18 L14 8"
          stroke="url(#logo-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M10 8 L14 8 L14 12"
          stroke="url(#logo-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="4" cy="18" r="1.6" fill="#E0375C" />
      </svg>
      <span className={`${text} font-bold text-ink tracking-tight`}>
        Arrow Physics
      </span>
    </Link>
  );
}
