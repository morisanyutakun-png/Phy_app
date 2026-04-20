import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { analyzeImage } from "@/lib/ai/analyze";
import { getUsageStatus, incrementUsage } from "@/lib/limits";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  uploadId: z.string().min(1),
});

async function fetchImageBase64(
  url: string
): Promise<{ base64: string; contentType: string } | null> {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return { contentType: match[1], base64: match[2] };
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "image/png";
    const buf = Buffer.from(await res.arrayBuffer());
    return { contentType: ct, base64: buf.toString("base64") };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "uploadId が必要です" },
      { status: 400 }
    );
  }

  const usage = await getUsageStatus(user.id);
  if (!usage.canAnalyze) {
    return NextResponse.json(
      {
        error: "今日の無料解析回数を使い切りました。Proに切り替えるか、明日また試してください。",
        code: "LIMIT_REACHED",
        usage,
      },
      { status: 429 }
    );
  }

  const upload = await prisma.upload.findFirst({
    where: { id: parsed.data.uploadId, userId: user.id },
  });
  if (!upload) {
    return NextResponse.json(
      { error: "画像が見つかりません" },
      { status: 404 }
    );
  }

  const fetched = await fetchImageBase64(upload.blobUrl);
  let result;
  try {
    result = await analyzeImage({
      imageUrl: upload.blobUrl,
      contentType: fetched?.contentType ?? upload.mimeType,
      imageBase64: fetched?.base64,
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "解析中にエラーが発生しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const analysis = await prisma.analysis.create({
    data: {
      uploadId: upload.id,
      userId: user.id,
      unit: result.unit,
      title: result.title ?? null,
      result: result as unknown as object,
    },
  });

  await incrementUsage(user.id);

  return NextResponse.json({
    analysisId: analysis.id,
    result,
  });
}
