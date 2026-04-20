import { AnalysisView } from "@/components/AnalysisView";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import type { AnalysisResult } from "@/types/analysis";
import { notFound } from "next/navigation";

export default async function AnalysisDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const analysis = await prisma.analysis.findFirst({
    where: { id: params.id, userId: user.id },
    include: { upload: true },
  });
  if (!analysis) notFound();

  const result = analysis.result as unknown as AnalysisResult;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">
          {analysis.title ?? "解析"}
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          {new Date(analysis.createdAt).toLocaleString("ja-JP")}
        </p>
      </div>
      <AnalysisView
        analysisId={analysis.id}
        imageUrl={analysis.upload.blobUrl}
        result={result}
      />
    </div>
  );
}
