import { AnalysisResult } from "@/types/analysis";

export interface SampleProblem {
  id: string;
  title: string;
  summary: string;
  /** Inline SVG (data URL) used as the "figure" so samples work without any uploads. */
  imageUrl: string;
  result: AnalysisResult;
}

function svgDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

// Background styles used by all samples for visual consistency.
function figure(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E4E8F3" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="600" fill="#FAFBFF"/>
    <rect width="800" height="600" fill="url(#grid)"/>
    ${body}
  </svg>`;
}

const INCLINE_SVG = figure(`
  <polygon points="80,520 720,520 720,220" fill="#D6DCEB" stroke="#5865A0" stroke-width="2"/>
  <g transform="translate(430,360) rotate(-26.57)">
    <rect x="-45" y="-35" width="90" height="70" rx="6" fill="#0B1020"/>
    <text x="0" y="6" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">A</text>
  </g>
  <text x="100" y="560" font-family="sans-serif" font-size="20" fill="#4B5575">粗い斜面（傾斜角 θ）</text>
`);

const HORIZONTAL_SVG = figure(`
  <rect x="40" y="420" width="720" height="14" fill="#5865A0"/>
  <rect x="40" y="434" width="720" height="6" fill="#3B4266"/>
  <rect x="330" y="340" width="140" height="80" rx="6" fill="#0B1020"/>
  <text x="400" y="390" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">A</text>
  <line x1="470" y1="380" x2="620" y2="380" stroke="#22B07D" stroke-width="3" marker-end="url(#mH)"/>
  <defs>
    <marker id="mH" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="#22B07D"/>
    </marker>
  </defs>
  <text x="550" y="370" font-family="sans-serif" font-size="18" fill="#22B07D">外力 F</text>
  <text x="60" y="470" font-family="sans-serif" font-size="20" fill="#4B5575">水平な粗い床</text>
`);

const SPRING_SVG = figure(`
  <rect x="40" y="280" width="30" height="120" fill="#5865A0"/>
  <path d="M70 340 q 20 -20 40 0 q 20 20 40 0 q 20 -20 40 0 q 20 20 40 0 q 20 -20 40 0 q 20 20 40 0"
        stroke="#0B1020" stroke-width="3" fill="none"/>
  <rect x="350" y="300" width="120" height="80" rx="6" fill="#0B1020"/>
  <text x="410" y="350" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">A</text>
  <rect x="40" y="400" width="720" height="6" fill="#3B4266"/>
  <text x="100" y="450" font-family="sans-serif" font-size="20" fill="#4B5575">なめらかな水平面 + ばね (自然長から右に x 変位)</text>
`);

const CIRCULAR_SVG = figure(`
  <circle cx="400" cy="300" r="180" fill="none" stroke="#5865A0" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="400" cy="300" r="4" fill="#5865A0"/>
  <rect x="560" y="280" width="50" height="40" rx="4" fill="#0B1020"/>
  <line x1="400" y1="300" x2="560" y2="300" stroke="#4B5575" stroke-width="2"/>
  <text x="470" y="290" font-family="sans-serif" font-size="18" fill="#4B5575">糸 L</text>
  <text x="100" y="540" font-family="sans-serif" font-size="20" fill="#4B5575">水平面上の等速円運動</text>
`);

const PROJECTILE_SVG = figure(`
  <rect x="40" y="520" width="720" height="14" fill="#5865A0"/>
  <path d="M120 500 Q 400 150 680 500" fill="none" stroke="#4B5575" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="400" cy="225" r="18" fill="#0B1020"/>
  <line x1="120" y1="500" x2="170" y2="445" stroke="#22B07D" stroke-width="3" marker-end="url(#mP)"/>
  <defs>
    <marker id="mP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="#22B07D"/>
    </marker>
  </defs>
  <text x="170" y="480" font-family="sans-serif" font-size="18" fill="#22B07D">初速 v0 (角度 θ)</text>
  <text x="100" y="560" font-family="sans-serif" font-size="20" fill="#4B5575">斜め投射（空気抵抗を無視）</text>
`);

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: "incline",
    title: "斜面を滑り下りる物体",
    summary: "重力・垂直抗力・摩擦力の向きを確かめる定番。",
    imageUrl: svgDataUrl(INCLINE_SVG),
    result: {
      unit: "INCLINE",
      title: "粗い斜面上を滑り下りる物体A",
      summary:
        "傾斜角θの粗い斜面上を物体Aが滑り下りる場面。摩擦力は『運動方向と逆』ではなく『相対運動と逆向き』、つまり斜面を上向きに働く。",
      objects: [
        { id: "A", label: "物体A", anchor: { x: 0.54, y: 0.6 } },
      ],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.54, y: 0.6 },
          to: { x: 0.54, y: 0.88 },
          reason: "重力は常に鉛直下向き。斜面でも向きは変わらない。",
          confidence: 0.98,
          commonMistakes: ["GRAVITY_MAGNITUDE", "NORMAL_NOT_VERTICAL_ON_INCLINE"],
        },
        {
          id: "N",
          objectId: "A",
          type: "force",
          label: "垂直抗力 N",
          from: { x: 0.54, y: 0.6 },
          to: { x: 0.42, y: 0.38 },
          reason: "斜面から受ける力は、斜面に対して垂直。",
          confidence: 0.95,
        },
        {
          id: "f",
          objectId: "A",
          type: "force",
          label: "動摩擦力 f",
          from: { x: 0.54, y: 0.6 },
          to: { x: 0.4, y: 0.52 },
          reason: "物体は斜面を下向きに動くので、動摩擦力は斜面を上向き。",
          confidence: 0.9,
          commonMistakes: ["FRICTION_DIRECTION"],
          alternate: {
            from: { x: 0.54, y: 0.6 },
            to: { x: 0.7, y: 0.7 },
            reason:
              "『運動方向に力を足す』と誤解した場合の描き方。動摩擦は常に相対運動と逆向きに働く。",
          },
        },
        {
          id: "v",
          objectId: "A",
          type: "velocity",
          label: "速度 v",
          from: { x: 0.54, y: 0.6 },
          to: { x: 0.72, y: 0.72 },
          reason: "物体は斜面に沿って下る向きに運動している。",
          confidence: 0.88,
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 a",
          from: { x: 0.54, y: 0.6 },
          to: { x: 0.68, y: 0.7 },
          reason:
            "mg sinθ が摩擦 μmg cosθ より大きければ、加速度は斜面を下る向き。",
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
          description: "斜面に垂直な方向は、力がつり合う。",
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
      title: "粗い水平面上で外力 F に引かれる物体A",
      summary:
        "粗い水平面上の物体Aが外力 F で右向きに引かれる場面。摩擦力は運動と逆向き（左）に働く。",
      objects: [{ id: "A", label: "物体A", anchor: { x: 0.5, y: 0.62 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.5, y: 0.62 },
          to: { x: 0.5, y: 0.85 },
          reason: "重力は鉛直下向き。",
          confidence: 0.98,
        },
        {
          id: "N",
          objectId: "A",
          type: "force",
          label: "垂直抗力 N",
          from: { x: 0.5, y: 0.62 },
          to: { x: 0.5, y: 0.4 },
          reason: "床から受ける力は鉛直上向き。mg と釣り合う。",
          confidence: 0.95,
        },
        {
          id: "F",
          objectId: "A",
          type: "force",
          label: "外力 F",
          from: { x: 0.5, y: 0.62 },
          to: { x: 0.75, y: 0.62 },
          reason: "問題文で与えられた水平外力。",
          confidence: 0.95,
        },
        {
          id: "f",
          objectId: "A",
          type: "force",
          label: "動摩擦力 f",
          from: { x: 0.5, y: 0.62 },
          to: { x: 0.32, y: 0.62 },
          reason: "物体は右向きに運動するので、動摩擦力は左向き。",
          confidence: 0.88,
          commonMistakes: ["FRICTION_DIRECTION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 a",
          from: { x: 0.5, y: 0.62 },
          to: { x: 0.7, y: 0.62 },
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
      title: "水平面でばねにつながれた物体A（右に x 変位）",
      summary:
        "自然長から右に x だけ変位したばねにつながれた物体A。弾性力は変位と逆向き（左）に働く。",
      objects: [{ id: "A", label: "物体A", anchor: { x: 0.52, y: 0.58 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.52, y: 0.58 },
          to: { x: 0.52, y: 0.82 },
          reason: "重力は鉛直下向き。",
          confidence: 0.95,
        },
        {
          id: "N",
          objectId: "A",
          type: "force",
          label: "垂直抗力 N",
          from: { x: 0.52, y: 0.58 },
          to: { x: 0.52, y: 0.34 },
          reason: "水平面から受ける力。mg と釣り合う。",
          confidence: 0.9,
        },
        {
          id: "kx",
          objectId: "A",
          type: "force",
          label: "弾性力 -kx",
          from: { x: 0.52, y: 0.58 },
          to: { x: 0.3, y: 0.58 },
          reason: "ばねが伸びているので、弾性力は自然長に戻す向き（左）。",
          confidence: 0.95,
          commonMistakes: ["SPRING_DIRECTION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 a",
          from: { x: 0.52, y: 0.58 },
          to: { x: 0.36, y: 0.58 },
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
      title: "糸につながれて水平円運動する物体A",
      summary:
        "糸にひもでつながれて水平面上を等速円運動する物体A。合力（＝向心力）は常に円の中心向き。",
      objects: [{ id: "A", label: "物体A", anchor: { x: 0.74, y: 0.5 } }],
      arrows: [
        {
          id: "T",
          objectId: "A",
          type: "force",
          label: "張力 T（向心力）",
          from: { x: 0.74, y: 0.5 },
          to: { x: 0.54, y: 0.5 },
          reason: "糸は物体を中心に引く。円運動の合力＝向心力はここ。",
          confidence: 0.9,
          commonMistakes: ["CENTRIPETAL_OUTWARD"],
        },
        {
          id: "v",
          objectId: "A",
          type: "velocity",
          label: "速度 v",
          from: { x: 0.74, y: 0.5 },
          to: { x: 0.74, y: 0.3 },
          reason: "円運動の速度は接線方向（等速円運動ではその瞬間の接線）。",
          confidence: 0.9,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "向心加速度 a",
          from: { x: 0.74, y: 0.5 },
          to: { x: 0.56, y: 0.5 },
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
          note: "慣性系で描く FBD には『遠心力』は存在しない。合力は中心向きで、それが向心力。",
        },
      ],
    },
  },
  {
    id: "projectile",
    title: "斜め投射",
    summary: "空中での力は重力のみ。水平方向に力を描かないことを確かめる。",
    imageUrl: svgDataUrl(PROJECTILE_SVG),
    result: {
      unit: "PROJECTILE",
      title: "斜め投射された物体（空気抵抗なし）",
      summary:
        "初速 v0、角度 θ で投げ上げられた物体。空中では重力のみが働き、水平方向の力は 0。",
      objects: [{ id: "A", label: "物体", anchor: { x: 0.5, y: 0.38 } }],
      arrows: [
        {
          id: "g",
          objectId: "A",
          type: "force",
          label: "重力 mg",
          from: { x: 0.5, y: 0.38 },
          to: { x: 0.5, y: 0.62 },
          reason: "空中では働くのは重力だけ。常に鉛直下向き。",
          confidence: 0.98,
          commonMistakes: ["PROJECTILE_HORIZONTAL_FORCE"],
        },
        {
          id: "v",
          objectId: "A",
          type: "velocity",
          label: "速度 v",
          from: { x: 0.5, y: 0.38 },
          to: { x: 0.62, y: 0.36 },
          reason: "水平成分は一定、鉛直成分は重力で時間変化する。",
          confidence: 0.85,
          commonMistakes: ["VELOCITY_VS_ACCELERATION"],
        },
        {
          id: "a",
          objectId: "A",
          type: "acceleration",
          label: "加速度 g",
          from: { x: 0.5, y: 0.38 },
          to: { x: 0.5, y: 0.56 },
          reason: "加速度は常に鉛直下向き g（大きさは一定）。",
          confidence: 0.95,
        },
      ],
      formulaHints: [
        {
          title: "水平方向",
          description: "力が働かないので等速。",
          expression: "x = v0 cosθ · t",
        },
        {
          title: "鉛直方向",
          description: "重力による等加速度運動。",
          expression: "y = v0 sinθ · t − (1/2) g t²",
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
