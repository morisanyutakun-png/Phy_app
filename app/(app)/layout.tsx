import { requireUser } from "@/lib/auth/user";
import { getUsageStatus } from "@/lib/limits";
import { AppHeader } from "@/components/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const usage = await getUsageStatus(user.id);
  return (
    <div className="min-h-dvh bg-[#F7F8FB]">
      <AppHeader
        email={user.email}
        plan={usage.plan}
        used={usage.used}
        limit={usage.limit}
      />
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
