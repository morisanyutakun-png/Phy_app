import { AnalysisResult } from "@/types/analysis";

/**
 * Canned demo result for when ANTHROPIC_API_KEY is not configured or AI fails.
 * Represents a block on an incline (一番よく使うシチュエーション) so the UI
 * always has something meaningful to render.
 */
export function demoAnalysis(): AnalysisResult {
  return {
    unit: "INCLINE",
    title: "斜面を滑り下りる物体（サンプル）",
    summary:
      "粗い斜面に置かれた物体が滑り下りる場面を想定したサンプル解析です。重力・垂直抗力・摩擦力の向きと、加速度の方向に注目しましょう。",
    objects: [
      {
        id: "block",
        label: "物体A",
        anchor: { x: 0.55, y: 0.5 },
        note: "質量 m。斜面上を滑り下りる。",
      },
    ],
    arrows: [
      {
        id: "a1",
        objectId: "block",
        type: "force",
        label: "重力 mg",
        from: { x: 0.55, y: 0.5 },
        to: { x: 0.55, y: 0.85 },
        reason: "地球が物体を引く力は常に鉛直下向き。",
        confidence: 0.95,
        commonMistakes: ["NORMAL_NOT_VERTICAL_ON_INCLINE"],
      },
      {
        id: "a2",
        objectId: "block",
        type: "force",
        label: "垂直抗力 N",
        from: { x: 0.55, y: 0.5 },
        to: { x: 0.35, y: 0.35 },
        reason: "斜面から受ける力は、斜面に垂直に外向き。",
        confidence: 0.9,
        commonMistakes: ["NORMAL_NOT_VERTICAL_ON_INCLINE"],
      },
      {
        id: "a3",
        objectId: "block",
        type: "force",
        label: "動摩擦力 f",
        from: { x: 0.55, y: 0.5 },
        to: { x: 0.38, y: 0.43 },
        reason: "物体は斜面を下る向きに動くので、摩擦力は斜面を上る向き。",
        confidence: 0.8,
        commonMistakes: ["FRICTION_DIRECTION"],
      },
      {
        id: "a4",
        objectId: "block",
        type: "velocity",
        label: "速度 v",
        from: { x: 0.55, y: 0.5 },
        to: { x: 0.75, y: 0.62 },
        reason: "物体は斜面に沿って下向きに運動している。",
        confidence: 0.85,
      },
      {
        id: "a5",
        objectId: "block",
        type: "acceleration",
        label: "加速度 a",
        from: { x: 0.55, y: 0.5 },
        to: { x: 0.72, y: 0.6 },
        reason:
          "重力の斜面方向成分が摩擦力より大きければ、加速度は斜面を下る向き。",
        confidence: 0.75,
        commonMistakes: ["VELOCITY_VS_ACCELERATION"],
      },
    ],
    formulaHints: [
      {
        title: "斜面方向の運動方程式",
        description:
          "斜面を下る向きを正として、ma = mg sinθ − μmg cosθ を立てる。",
        expression: "m a = m g sinθ − μ m g cosθ",
      },
      {
        title: "斜面に垂直方向のつり合い",
        description: "垂直抗力 N は mg cosθ。",
        expression: "N = m g cosθ",
      },
    ],
    coachingNotes: [
      {
        tag: "FRICTION_DIRECTION",
        note: "摩擦力は『動いている向き』ではなく、『動こうとする相対運動と逆向き』に描きます。",
      },
      {
        tag: "VELOCITY_VS_ACCELERATION",
        note: "速度と加速度は向きが一致するとは限りません。減速中なら加速度は速度と逆向きです。",
      },
    ],
  };
}
