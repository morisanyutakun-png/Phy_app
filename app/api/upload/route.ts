import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "画像ファイルが選択されていません" },
      { status: 400 }
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "PNG / JPEG / WEBP のみ対応しています" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "画像サイズは 8MB 以下にしてください" },
      { status: 400 }
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const stamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]+/g, "_") || "image.png";
  const key = `uploads/${user.id}/${stamp}-${safeName}`;

  let blobUrl: string;
  if (token) {
    const blob = await put(key, file, {
      access: "public",
      token,
      contentType: file.type,
    });
    blobUrl = blob.url;
  } else {
    // Dev fallback: embed the image as a data URL so the flow works even
    // without Vercel Blob configured.
    const buf = Buffer.from(await file.arrayBuffer());
    blobUrl = `data:${file.type};base64,${buf.toString("base64")}`;
  }

  const upload = await prisma.upload.create({
    data: {
      userId: user.id,
      blobUrl,
      filename: file.name,
      mimeType: file.type,
    },
  });

  return NextResponse.json({
    uploadId: upload.id,
    url: blobUrl,
  });
}
