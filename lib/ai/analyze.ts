import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, MisconceptionTag } from "@/types/analysis";
import { MISCONCEPTIONS } from "@/lib/misconceptions";
import { ANALYSIS_JSON_SCHEMA_HINT, ANALYSIS_SYSTEM_PROMPT } from "./prompt";
import { demoAnalysis } from "./demo";

const VALID_TAGS = new Set(Object.keys(MISCONCEPTIONS)) as Set<string>;

function toMisconceptionTag(v: unknown): MisconceptionTag | null {
  if (typeof v !== "string") return null;
  return VALID_TAGS.has(v) ? (v as MisconceptionTag) : null;
}

function parseJsonSafely(text: string): unknown {
  // Strip ``` fences if the model leaked any
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const first = stripped.indexOf("{");
    const last = stripped.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(stripped.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function sanitizeResult(raw: unknown): AnalysisResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const allowedUnits = new Set([
    "HORIZONTAL",
    "INCLINE",
    "SPRING",
    "CIRCULAR",
    "PROJECTILE",
    "UNKNOWN",
  ]);
  const unit =
    typeof r.unit === "string" && allowedUnits.has(r.unit)
      ? (r.unit as AnalysisResult["unit"])
      : "UNKNOWN";

  const objects = Array.isArray(r.objects)
    ? r.objects
        .map((o: any, i: number) => ({
          id: String(o?.id ?? `obj${i}`),
          label: String(o?.label ?? "物体"),
          anchor: {
            x: clamp01(Number(o?.anchor?.x ?? 0.5)),
            y: clamp01(Number(o?.anchor?.y ?? 0.5)),
          },
          note: typeof o?.note === "string" ? o.note : undefined,
        }))
        .slice(0, 6)
    : [{ id: "obj0", label: "物体", anchor: { x: 0.5, y: 0.5 } }];

  const allowedArrowTypes = new Set(["force", "velocity", "acceleration"]);
  const arrows = Array.isArray(r.arrows)
    ? r.arrows
        .map((a: any, i: number) => {
          const type = allowedArrowTypes.has(a?.type) ? a.type : "force";
          return {
            id: String(a?.id ?? `arrow${i}`),
            objectId: String(a?.objectId ?? objects[0]?.id ?? "obj0"),
            type: type as "force" | "velocity" | "acceleration",
            label: String(a?.label ?? "矢印"),
            from: {
              x: clamp01(Number(a?.from?.x ?? 0.5)),
              y: clamp01(Number(a?.from?.y ?? 0.5)),
            },
            to: {
              x: clamp01(Number(a?.to?.x ?? 0.5)),
              y: clamp01(Number(a?.to?.y ?? 0.5)),
            },
            reason: String(a?.reason ?? ""),
            confidence: clamp01(Number(a?.confidence ?? 0.5)),
            commonMistakes: Array.isArray(a?.commonMistakes)
              ? (a.commonMistakes
                  .map(toMisconceptionTag)
                  .filter((m: MisconceptionTag | null) => m !== null) as MisconceptionTag[])
              : undefined,
            alternate:
              a?.alternate && typeof a.alternate === "object"
                ? {
                    from: {
                      x: clamp01(Number(a.alternate?.from?.x ?? 0.5)),
                      y: clamp01(Number(a.alternate?.from?.y ?? 0.5)),
                    },
                    to: {
                      x: clamp01(Number(a.alternate?.to?.x ?? 0.5)),
                      y: clamp01(Number(a.alternate?.to?.y ?? 0.5)),
                    },
                    reason: String(a.alternate?.reason ?? ""),
                  }
                : undefined,
          };
        })
        .slice(0, 10)
    : [];

  const formulaHints = Array.isArray(r.formulaHints)
    ? r.formulaHints
        .map((h: any) => ({
          title: String(h?.title ?? ""),
          description: String(h?.description ?? ""),
          expression:
            typeof h?.expression === "string" ? h.expression : undefined,
        }))
        .slice(0, 6)
    : [];

  const coachingNotes = Array.isArray(r.coachingNotes)
    ? (r.coachingNotes
        .map((c: any) => {
          const tag = toMisconceptionTag(c?.tag);
          if (!tag) return null;
          return { tag, note: String(c?.note ?? "") };
        })
        .filter(
          (c: { tag: MisconceptionTag; note: string } | null): c is { tag: MisconceptionTag; note: string } =>
            c !== null
        )
        .slice(0, 8) as Array<{ tag: MisconceptionTag; note: string }>)
    : [];

  return {
    unit,
    title: typeof r.title === "string" ? r.title : undefined,
    summary: typeof r.summary === "string" ? r.summary : "",
    objects,
    arrows,
    formulaHints,
    coachingNotes,
  };
}

/**
 * Run Claude vision to produce an AnalysisResult from the image.
 * Falls back to a canned demo response if no API key is set and
 * DEMO_MODE_FALLBACK=true.
 */
export async function analyzeImage(params: {
  imageUrl: string;
  contentType: string;
  imageBase64?: string;
}): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const demoOk = process.env.DEMO_MODE_FALLBACK === "true";

  if (!apiKey) {
    if (demoOk) return demoAnalysis();
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const mediaType = (params.contentType || "image/png").toLowerCase();
  const imageBlock = params.imageBase64
    ? {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: params.imageBase64,
        },
      }
    : {
        type: "image" as const,
        source: { type: "url" as const, url: params.imageUrl },
      };

  const userContent = [
    imageBlock,
    {
      type: "text" as const,
      text: `${ANALYSIS_JSON_SCHEMA_HINT}\n\n上記スキーマに従い、この画像を解析してください。JSONのみを返してください。`,
    },
  ];

  let responseText = "";
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: ANALYSIS_SYSTEM_PROMPT,
      // Cast: the Anthropic SDK content types shift between minor versions.
      messages: [{ role: "user", content: userContent as any }],
    });
    responseText = (msg.content as any[])
      .filter((b) => b?.type === "text")
      .map((b) => b.text as string)
      .join("\n");
  } catch (err) {
    if (demoOk) return demoAnalysis();
    throw err;
  }

  const parsed = parseJsonSafely(responseText);
  const result = sanitizeResult(parsed);
  if (!result) {
    if (demoOk) return demoAnalysis();
    throw new Error("AI返答のJSONを解釈できませんでした");
  }
  return result;
}
