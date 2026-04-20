import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SAMPLE_PROBLEMS } from "../lib/samples";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@arrowphysics.app";
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, plan: "PRO" },
  });

  console.log("Seeded demo user:", email, "/ password: demo1234");

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
