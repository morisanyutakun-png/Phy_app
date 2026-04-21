import { AnalysisResult } from "@/types/analysis";

export interface SampleProblem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  result: AnalysisResult;
}

function svgDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

const COMMON_DEFS = `
  <defs>
    <linearGradient id="blockGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1C2340"/>
      <stop offset="100%" stop-color="#0B1020"/>
    </linearGradient>
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5865A0"/>
      <stop offset="100%" stop-color="#3B4266"/>
    </linearGradient>
    <linearGradient id="slopeGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E4E8F3"/>
      <stop offset="100%" stop-color="#C7CEE0"/>
    </linearGradient>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="#fff"/>
      <line x1="0" y1="0" x2="0" y2="10" stroke="#8A93B3" stroke-width="2"/>
    </pattern>
  </defs>
`;

function figure(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    ${COMMON_DEFS}
    <rect width="800" height="600" fill="#FBFCFF"/>
    ${body}
  </svg>`;
}

// Draws a helical spring as a 2D projection of a 3D helix with a slight
// perspective skew along the axis. The x-offset (sin(t)*skew) makes the
// "back" of each coil visually cross behind the next coil's "front", giving
// a proper twisting appearance instead of a flat zigzag/dango.
function helicalSpringPath(
  x0: number,
  x1: number,
  cy: number,
  coils: number,
  radius: number,
  samples: number = 240
): string {
  const length = x1 - x0;
  const pitch = length / coils;
  const skew = pitch * 0.48;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const t = u * coils * 2 * Math.PI - Math.PI / 2;
    const alongX = x0 + u * length;
    const x = alongX + (Math.sin(t) + 1) * skew;
    const y = cy - Math.cos(t) * radius;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

// 1: INCLINE ----------------------------------------------------------------
const INCLINE_SVG = figure(`
  <!-- ground -->
  <rect x="0" y="520" width="800" height="80" fill="url(#hatch)" opacity="0.5"/>
  <!-- incline -->
  <polygon points="80,520 720,520 720,210" fill="url(#slopeGrad)" stroke="#5865A0" stroke-width="2"/>
  <!-- angle arc + theta -->
  <path d="M 200,520 A 120,120 0 0 0 140,460" fill="none" stroke="#5865A0" stroke-width="2"/>
  <text x="170" y="505" font-family="sans-serif" font-size="26" fill="#4B5575" font-style="italic">θ</text>
  <!-- block sitting on slope (bottom face flush with hypotenuse) -->
  <g transform="translate(424,313) rotate(-25.84)">
    <rect x="-50" y="-36" width="100" height="72" rx="6" fill="url(#blockGrad)"/>
    <text x="0" y="8" fill="#fff" font-family="sans-serif" font-size="26" font-weight="700" text-anchor="middle">m</text>
  </g>
  <!-- labels -->
  <text x="100" y="575" font-family="sans-serif" font-size="20" fill="#4B5575">粗い斜面</text>
`);

// 2: HORIZONTAL -------------------------------------------------------------
const HORIZONTAL_SVG = figure(`
  <!-- ground -->
  <rect x="40" y="430" width="720" height="14" fill="url(#floorGrad)"/>
  <rect x="40" y="444" width="720" height="60" fill="url(#hatch)" opacity="0.5"/>
  <!-- block (bottom on floor: center at y=385, half-height 45) -->
  <g transform="translate(400,385)">
    <rect x="-70" y="-45" width="140" height="90" rx="6" fill="url(#blockGrad)"/>
    <text x="0" y="8" fill="#fff" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle">m</text>
  </g>
  <!-- external force F (drawn inside figure so it reads as part of the scene) -->
  <defs>
    <marker id="mHx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
      <path d="M0,1 L10,5 L0,9 z" fill="#22B07D"/>
    </marker>
  </defs>
  <line x1="470" y1="385" x2="640" y2="385" stroke="#22B07D" stroke-width="4" marker-end="url(#mHx)" stroke-linecap="round"/>
  <text x="560" y="370" font-family="sans-serif" font-size="20" fill="#22B07D" font-weight="700">F</text>
  <text x="60" y="490" font-family="sans-serif" font-size="20" fill="#4B5575">粗い水平面</text>
`);

// 3: SPRING -----------------------------------------------------------------
const SPRING_SVG = figure(`
  <!-- ground -->
  <rect x="40" y="430" width="720" height="14" fill="url(#floorGrad)"/>
  <rect x="40" y="444" width="720" height="60" fill="url(#hatch)" opacity="0.5"/>
  <!-- wall -->
  <rect x="40" y="220" width="28" height="210" fill="url(#floorGrad)"/>
  <rect x="40" y="220" width="28" height="210" fill="url(#hatch)" opacity="0.4"/>
  <!-- spring: proper 3D helix projection (twisting coils, not zigzag) -->
  <path d="${helicalSpringPath(68, 330, 375, 9, 24)}"
        stroke="#0B1020" stroke-width="2.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <!-- block (bottom on floor) -->
  <g transform="translate(410,375)">
    <rect x="-80" y="-55" width="160" height="110" rx="6" fill="url(#blockGrad)"/>
    <text x="0" y="8" fill="#fff" font-family="sans-serif" font-size="30" font-weight="700" text-anchor="middle">m</text>
  </g>
  <!-- natural-length reference (at rest, block's left edge would sit here) -->
  <line x1="260" y1="230" x2="260" y2="430" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="212" y="222" font-family="sans-serif" font-size="14" fill="#94A3B8">自然長</text>
  <!-- x marker (displacement from natural length) -->
  <line x1="260" y1="470" x2="330" y2="470" stroke="#4B5575" stroke-width="1.5"/>
  <line x1="260" y1="464" x2="260" y2="476" stroke="#4B5575" stroke-width="1.5"/>
  <line x1="330" y1="464" x2="330" y2="476" stroke="#4B5575" stroke-width="1.5"/>
  <text x="295" y="488" font-family="sans-serif" font-size="18" fill="#4B5575" text-anchor="middle" font-style="italic">x</text>
  <text x="60" y="555" font-family="sans-serif" font-size="20" fill="#4B5575">なめらかな水平面 + ばね</text>
`);

// 4: CIRCULAR ---------------------------------------------------------------
const CIRCULAR_SVG = figure(`
  <!-- orbit -->
  <circle cx="400" cy="300" r="200" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="6 6"/>
  <!-- center -->
  <circle cx="400" cy="300" r="5" fill="#4B5575"/>
  <text x="395" y="290" font-family="sans-serif" font-size="14" fill="#4B5575" text-anchor="end">O</text>
  <!-- string -->
  <line x1="400" y1="300" x2="600" y2="300" stroke="#0B1020" stroke-width="2"/>
  <text x="500" y="290" font-family="sans-serif" font-size="18" fill="#4B5575" text-anchor="middle">L</text>
  <!-- object -->
  <g transform="translate(600,300)">
    <circle r="30" fill="url(#blockGrad)"/>
    <text x="0" y="7" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">m</text>
  </g>
  <text x="60" y="560" font-family="sans-serif" font-size="20" fill="#4B5575">水平面上の等速円運動</text>
`);

// 5: PROJECTILE -------------------------------------------------------------
const PROJECTILE_SVG = figure(`
  <!-- ground -->
  <rect x="40" y="510" width="720" height="14" fill="url(#floorGrad)"/>
  <rect x="40" y="524" width="720" height="60" fill="url(#hatch)" opacity="0.5"/>
  <!-- trajectory -->
  <path d="M 120 510 Q 400 80 680 510" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 6"/>
  <!-- launch point and v0 -->
  <circle cx="120" cy="510" r="4" fill="#4B5575"/>
  <defs>
    <marker id="mPv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
      <path d="M0,1 L10,5 L0,9 z" fill="#22B07D"/>
    </marker>
  </defs>
  <line x1="120" y1="510" x2="210" y2="420" stroke="#22B07D" stroke-width="4" marker-end="url(#mPv)" stroke-linecap="round"/>
  <path d="M 160 510 A 40 40 0 0 0 150 470" fill="none" stroke="#4B5575" stroke-width="1.5"/>
  <text x="178" y="498" font-family="sans-serif" font-size="18" fill="#4B5575" font-style="italic">θ</text>
  <text x="210" y="395" font-family="sans-serif" font-size="18" fill="#22B07D" font-weight="700">v₀</text>
  <!-- ball in flight -->
  <circle cx="400" cy="220" r="20" fill="url(#blockGrad)"/>
  <text x="60" y="565" font-family="sans-serif" font-size="20" fill="#4B5575">斜め投射（空気抵抗なし）</text>
`);

// For each sample, keep arrow directions physically correct but offset the
// tails slightly per-type so the labels don't stack on top of each other.
export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: "incline",
    title: "斜面を滑り下りる物体",
    summary: "重力・垂直抗力・摩擦力の向きを確かめる定番。",
    imageUrl: svgDataUrl(INCLINE_SVG),
    result: {
      unit: "INCLINE",
      title: "粗い斜面上を滑り下りる物体",
      summary:
        "傾斜角 θ の粗い斜面上を物体が滑り下りる場面。摩擦力は『運動方向と逆』ではなく『相対運動と逆向き』、つまり斜面を上る向きに働く。",
      objects: [{ id: "A", label: "物体", anchor: { x: 0.53, y: 0.522 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.53, y: 0.522 },
          to: { x: 0.53, y: 0.792 },
          reason: "重力は常に鉛直下向き。斜面でも向きは変わらない。",
          confidence: 0.98,
          commonMistakes: ["GRAVITY_MAGNITUDE", "NORMAL_NOT_VERTICAL_ON_INCLINE"],
        },
        // Decomposition of mg along the slope (motion direction). This is the
        // physically key component: ma = mg sinθ − μ mg cosθ. Drawn dashed to
        // signal it's a split of mg, not an independent force.
        {
          id: "mgSin",
          objectId: "A",
          type: "force",
          label: "mg sinθ",
          from: { x: 0.53, y: 0.522 },
          to: { x: 0.452, y: 0.571 },
          reason:
            "重力の斜面に沿った成分。これが物体を斜面下向きに加速させる正味の駆動力の源。",
          confidence: 0.95,
          isComponent: true,
          componentOf: "g",
        },
        // Decomposition of mg perpendicular to the slope. Balances N.
        {
          id: "mgCos",
          objectId: "A",
          type: "force",
          label: "mg cosθ",
          from: { x: 0.53, y: 0.522 },
          to: { x: 0.608, y: 0.743 },
          reason:
            "重力の斜面に垂直な成分。垂直抗力 N と釣り合う（鉛直方向のつり合いではなく、斜面垂直方向のつり合い）。",
          confidence: 0.95,
          isComponent: true,
          componentOf: "g",
        },
        {
          id: "N",
          objectId: "A",
          type: "force",
          label: "垂直抗力 N",
          from: { x: 0.53, y: 0.522 },
          to: { x: 0.40, y: 0.262 },
          reason: "斜面から受ける力は、斜面に対して垂直。",
          confidence: 0.95,
        },
        {
          id: "f",
          objectId: "A",
          type: "force",
          label: "動摩擦力 f",
          from: { x: 0.53, y: 0.522 },
          to: { x: 0.35, y: 0.432 },
          reason: "物体は斜面を下向きに動くので、動摩擦力は斜面を上向き。",
          confidence: 0.9,
          commonMistakes: ["FRICTION_DIRECTION"],
          alternate: {
            from: { x: 0.53, y: 0.522 },
            to: { x: 0.71, y: 0.612 },
            reason:
              "『運動方向に力を足す』と誤解したときの描き方。動摩擦は常に相対運動と逆向き。",
          },
        },
        {
          id: "v",
          objectId: "A",
          type: "velocity",
          label: "速度 v",
          from: { x: 0.55, y: 0.552 },
          to: { x: 0.77, y: 0.672 },
          reason: "物体は斜面に沿って下る向きに運動している。",
          confidence: 0.88,
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 a",
          from: { x: 0.51, y: 0.492 },
          to: { x: 0.65, y: 0.572 },
          reason:
            "mg sinθ が摩擦 μmg cosθ より大きいと、加速度は斜面を下る向き。",
          confidence: 0.8,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
      ],
      formulaHints: [
        {
          title: "斜面方向の運動方程式",
          description: "斜面を下る向きを正にとり、運動方程式を立てる。",
          expression: "m a = m g sinθ − μ m g cosθ",
        },
        {
          title: "斜面垂直方向のつり合い",
          description: "斜面に垂直な方向は、力が釣り合う。",
          expression: "N = m g cosθ",
        },
      ],
      coachingNotes: [
        {
          tag: "FRICTION_DIRECTION",
          note: "摩擦力は『運動方向と逆』ではなく『相対運動と逆向き』。静止時は外力と釣り合う向きに変わる。",
        },
        {
          tag: "NORMAL_NOT_VERTICAL_ON_INCLINE",
          note: "重力は鉛直下向きに 1 本だけ描き、そのあとで斜面方向・斜面垂直方向に分解する。",
        },
      ],
    },
  },
  {
    id: "horizontal",
    title: "水平面上を引かれる物体",
    summary: "外力・摩擦・加速度の向きの関係を確かめる。",
    imageUrl: svgDataUrl(HORIZONTAL_SVG),
    result: {
      unit: "HORIZONTAL",
      title: "粗い水平面上で外力 F に引かれる物体",
      summary:
        "粗い水平面上の物体が外力 F で右向きに引かれる場面。摩擦力は運動と逆向き（左）に働く。",
      objects: [{ id: "A", label: "物体", anchor: { x: 0.5, y: 0.63 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.5, y: 0.63 },
          to: { x: 0.5, y: 0.87 },
          reason: "重力は鉛直下向き。",
          confidence: 0.98,
        },
        {
          id: "N",
          objectId: "A",
          type: "force",
          label: "垂直抗力 N",
          from: { x: 0.5, y: 0.63 },
          to: { x: 0.5, y: 0.38 },
          reason: "床から受ける力は鉛直上向き。mg と釣り合う。",
          confidence: 0.95,
        },
        {
          id: "F",
          objectId: "A",
          type: "force",
          label: "外力 F'",
          from: { x: 0.52, y: 0.6 },
          to: { x: 0.78, y: 0.6 },
          reason: "問題文で与えられた水平外力。",
          confidence: 0.95,
        },
        {
          id: "f",
          objectId: "A",
          type: "force",
          label: "動摩擦力 f",
          from: { x: 0.48, y: 0.66 },
          to: { x: 0.3, y: 0.66 },
          reason: "物体は右向きに運動するので、動摩擦力は左向き。",
          confidence: 0.88,
          commonMistakes: ["FRICTION_DIRECTION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 a",
          from: { x: 0.5, y: 0.55 },
          to: { x: 0.66, y: 0.55 },
          reason: "F − f > 0 なら加速度は F と同じ向き。",
          confidence: 0.85,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
      ],
      formulaHints: [
        {
          title: "水平方向の運動方程式",
          description: "右向きを正として運動方程式を立てる。",
          expression: "m a = F − μ m g",
        },
        {
          title: "鉛直方向のつり合い",
          description: "鉛直方向は加速していないので、N と mg は釣り合う。",
          expression: "N = m g",
        },
      ],
      coachingNotes: [
        {
          tag: "FRICTION_DIRECTION",
          note: "摩擦は『外力の逆』ではなく『相対運動の逆』。静止時は外力と釣り合う向きに変わる。",
        },
      ],
    },
  },
  {
    id: "spring",
    title: "ばねにつながれた物体",
    summary: "変位と弾性力の向きを確かめる。",
    imageUrl: svgDataUrl(SPRING_SVG),
    result: {
      unit: "SPRING",
      title: "水平面でばねにつながれた物体（右に x 変位）",
      summary:
        "自然長から右に x だけ変位したばねにつながれた物体。弾性力は変位と逆向き（左）に働く。",
      objects: [{ id: "A", label: "物体", anchor: { x: 0.513, y: 0.625 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.513, y: 0.625 },
          to: { x: 0.513, y: 0.87 },
          reason: "重力は鉛直下向き。",
          confidence: 0.95,
        },
        {
          id: "N",
          objectId: "A",
          type: "force",
          label: "垂直抗力 N",
          from: { x: 0.513, y: 0.625 },
          to: { x: 0.513, y: 0.38 },
          reason: "水平面から受ける力。mg と釣り合う。",
          confidence: 0.9,
        },
        {
          id: "kx",
          objectId: "A",
          type: "force",
          label: "弾性力 −kx",
          from: { x: 0.493, y: 0.605 },
          to: { x: 0.28, y: 0.605 },
          reason: "ばねが伸びているので、弾性力は自然長に戻す向き（左）。",
          confidence: 0.95,
          commonMistakes: ["SPRING_DIRECTION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 a",
          from: { x: 0.513, y: 0.665 },
          to: { x: 0.35, y: 0.665 },
          reason: "弾性力が合力なので、加速度も左向き。",
          confidence: 0.88,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
      ],
      formulaHints: [
        {
          title: "単振動の運動方程式",
          description: "ばねによる復元力から運動方程式を立てる。",
          expression: "m a = − k x",
        },
        {
          title: "角振動数",
          description: "単振動の角振動数は ω = √(k/m)。",
          expression: "ω = √(k / m)",
        },
      ],
      coachingNotes: [
        {
          tag: "SPRING_DIRECTION",
          note: "弾性力は『自然長に戻す向き』。伸びていれば縮ませる向き、縮んでいれば伸ばす向き。",
        },
      ],
    },
  },
  {
    id: "circular",
    title: "水平面の円運動",
    summary: "向心力・向心加速度が『中心向き』であることを確かめる。",
    imageUrl: svgDataUrl(CIRCULAR_SVG),
    result: {
      unit: "CIRCULAR",
      title: "糸につながれて水平円運動する物体",
      summary:
        "糸でつながれて水平面上を等速円運動する物体。合力（＝向心力）は常に円の中心向き。",
      objects: [{ id: "A", label: "物体", anchor: { x: 0.75, y: 0.5 } }],
      arrows: [
        {
          id: "T",
          objectId: "A",
          type: "force",
          label: "張力 T（向心力）",
          from: { x: 0.73, y: 0.5 },
          to: { x: 0.55, y: 0.5 },
          reason: "糸は物体を中心に引く。円運動の合力＝向心力はここ。",
          confidence: 0.9,
          commonMistakes: ["CENTRIPETAL_OUTWARD"],
        },
        {
          id: "v",
          objectId: "A",
          type: "velocity",
          label: "速度 v",
          from: { x: 0.75, y: 0.5 },
          to: { x: 0.75, y: 0.28 },
          reason: "円運動の速度は接線方向。",
          confidence: 0.9,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "向心加速度 a",
          from: { x: 0.73, y: 0.54 },
          to: { x: 0.58, y: 0.54 },
          reason: "円運動の加速度は常に中心向き。",
          confidence: 0.92,
          commonMistakes: ["CENTRIPETAL_OUTWARD"],
        },
      ],
      formulaHints: [
        {
          title: "向心力の式",
          description: "半径 L、速さ v の等速円運動の向心力。",
          expression: "T = m v² / L",
        },
        {
          title: "向心加速度",
          description: "角速度 ω を使うと a = ω² L とも書ける。",
          expression: "a = v² / L = ω² L",
        },
      ],
      coachingNotes: [
        {
          tag: "CENTRIPETAL_OUTWARD",
          note: "慣性系で描く FBD に『遠心力』は存在しない。合力は中心向きで、それが向心力。",
        },
      ],
    },
  },
  {
    id: "projectile",
    title: "斜め投射",
    summary: "空中では重力のみ。水平方向に力を描かないことを確かめる。",
    imageUrl: svgDataUrl(PROJECTILE_SVG),
    result: {
      unit: "PROJECTILE",
      title: "斜め投射された物体（空気抵抗なし）",
      summary:
        "初速 v₀、角度 θ で投げ上げられた物体。空中では重力のみが働き、水平方向の力は 0。",
      objects: [{ id: "A", label: "物体", anchor: { x: 0.5, y: 0.37 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.5, y: 0.37 },
          to: { x: 0.5, y: 0.6 },
          reason: "空中では働くのは重力だけ。常に鉛直下向き。",
          confidence: 0.98,
          commonMistakes: ["PROJECTILE_HORIZONTAL_FORCE"],
        },
        {
          id: "v",
          objectId: "A",
          type: "velocity",
          label: "速度 v",
          from: { x: 0.52, y: 0.35 },
          to: { x: 0.66, y: 0.32 },
          reason: "水平成分は一定、鉛直成分は重力で時間変化する。",
          confidence: 0.85,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 g",
          from: { x: 0.48, y: 0.4 },
          to: { x: 0.48, y: 0.55 },
          reason: "加速度は常に鉛直下向き g（大きさは一定）。",
          confidence: 0.95,
        },
      ],
      formulaHints: [
        {
          title: "水平方向",
          description: "力が働かないので等速。",
          expression: "x = v₀ cosθ · t",
        },
        {
          title: "鉛直方向",
          description: "重力による等加速度運動。",
          expression: "y = v₀ sinθ · t − (1/2) g t²",
        },
      ],
      coachingNotes: [
        {
          tag: "PROJECTILE_HORIZONTAL_FORCE",
          note: "『進行方向の力』を描かない。空気抵抗を無視するとき、空中の力は重力のみ。",
        },
      ],
    },
  },
];

export function getSample(id: string): SampleProblem | null {
  return SAMPLE_PROBLEMS.find((s) => s.id === id) ?? null;
}
