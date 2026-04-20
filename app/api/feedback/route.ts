import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { AnalysisResult } from "@/types/analysis";

const schema = z.object({
  analysisId: z.string().min(1),
  judgments: z.array(
    z.object({
      arrowId: z.string().min(1),
      arrowLabel: z.string().min(1),
      judgment: z.enum(["CORRECT", "UNNECESSARY", "WRONG_DIRECTION"]),
    })
  ),
  userAdded: z
    .array(
      z.object({
        arrowId: z.string(),
        arrowLabel: z.string(),
        data: z.record(z.any()),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const analysis = await prisma.analysis.findFirst({
    where: { id: parsed.data.analysisId, userId: user.id },
  });
  if (!analysis) {
    return NextResponse.json(
      { error: "解析が見つかりません" },
      { status: 404 }
    );
  }

  // Derive mistake tags from the judgments users made.
  const result = analysis.result as unknown as AnalysisResult;
  const arrowMap = new Map(result.arrows.map((a) => [a.id, a]));
  const mistakeTags = new Set<string>();
  for (const j of parsed.data.judgments) {
    if (j.judgment === "WRONG_DIRECTION" || j.judgment === "UNNECESSARY") {
      const arrow = arrowMap.get(j.arrowId);
      arrow?.commonMistakes?.forEach((t) => mistakeTags.add(t));
    }
  }

  await prisma.$transaction([
    prisma.arrowFeedback.deleteMany({
      where: { analysisId: analysis.id },
    }),
    prisma.arrowFeedback.createMany({
      data: [
        ...parsed.data.judgments.map((j) => ({
          analysisId: analysis.id,
          arrowId: j.arrowId,
          arrowLabel: j.arrowLabel,
          judgment: j.judgment,
        })),
        ...(parsed.data.userAdded ?? []).map((u) => ({
          analysisId: analysis.id,
          arrowId: u.arrowId,
          arrowLabel: u.arrowLabel,
          judgment: "USER_ADDED" as const,
          addedData: u.data,
        })),
      ],
    }),
    prisma.analysis.update({
      where: { id: analysis.id },
      data: { mistakeTags: Array.from(mistakeTags) },
    }),
  ]);

  return NextResponse.json({ ok: true, mistakeTags: Array.from(mistakeTags) });
}
