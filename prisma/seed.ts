import { PrismaClient } from "@prisma/client";
import { SAMPLE_PROBLEMS } from "../lib/samples";

const prisma = new PrismaClient();

async function main() {
  // A placeholder PRO user so sample analyses have something to belong to.
  // Actual users log in via Google OAuth — this row is not reachable from the
  // login flow, it just gives the seeded history a home.
  const email = "demo@arrowphysics.app";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, plan: "PRO" },
  });
  console.log("Seeded placeholder demo user:", email);

  for (const s of SAMPLE_PROBLEMS.slice(0, 3)) {
    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        blobUrl: s.imageUrl,
        filename: `${s.id}.svg`,
        mimeType: "image/svg+xml",
      },
    });
    await prisma.analysis.create({
      data: {
        uploadId: upload.id,
        userId: user.id,
        unit: s.result.unit,
        title: s.result.title ?? s.title,
        result: s.result as unknown as object,
      },
    });
  }
  console.log("Seeded sample analyses:", SAMPLE_PROBLEMS.length);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
