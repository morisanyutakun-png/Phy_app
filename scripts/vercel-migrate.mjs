// Run `prisma db push` only when building on Vercel. Locally, devs may not
// want a build to mutate their DB (or may not even have DATABASE_URL set),
// so this is a no-op outside Vercel.
import { spawnSync } from "node:child_process";

if (process.env.VERCEL === "1") {
  console.log("[vercel-migrate] applying Prisma schema to production DB…");
  const res = spawnSync(
    "npx",
    ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"],
    { stdio: "inherit" }
  );
  process.exit(res.status ?? 1);
} else {
  console.log("[vercel-migrate] skipping (not on Vercel).");
}
