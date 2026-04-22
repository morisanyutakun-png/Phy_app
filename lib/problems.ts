// Curated library of classic physics problems. The LP pitches "arrow-based
// understanding"; this file is the actual content that delivers it.
// Each problem drives an animated simulation + arrow overlay + text coaching.

import type { MisconceptionTag } from "@/types/analysis";

export type PhysUnit =
  | "HORIZONTAL"
  | "INCLINE"
  | "SPRING"
  | "CIRCULAR"
  | "PROJECTILE";

export type SimType = "incline" | "horizontal" | "spring" | "circular" | "projectile";

export type Tier = "FREE" | "PRO";

export interface SimParams {
  // Incline / horizontal
  angle?: number; // degrees
  frictionMu?: number;
  mass?: number;
  force?: number;
  // Spring
  k?: number;
  amplitude?: number;
  // Circular
  radius?: number;
  omega?: number;
  // Projectile
  v0?: number;
  launchAngle?: number;
}

export interface ControllableParam {
  key: keyof SimParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface ArrowToggles {
  force?: boolean;
  velocity?: boolean;
  acceleration?: boolean;
  decomposition?: boolean;
}

export interface Formula {
  title: string;
  expr: string;
  note?: string;
}

export interface MisconceptionCard {
  tag: MisconceptionTag;
  label: string;
  short: string;
}

export interface Problem {
  slug: string;
  unit: PhysUnit;
  title: string;
  summary: string;
  tier: Tier;
  level: "基礎" | "標準" | "発展";
  keyInsights: string[];
  formulas: Formula[];
  misconceptions: MisconceptionCard[];
  simulation: {
    type: SimType;
    params: SimParams;
    controllable: ControllableParam[];
    arrows: ArrowToggles;
  };
}

export const UNIT_LABEL: Record<PhysUnit, string> = {
  HORIZONTAL: "水平面",
  INCLINE: "斜面",
  SPRING: "ばね",
  CIRCULAR: "円運動",
  PROJECTILE: "投射",
};

export const UNIT_ORDER: PhysUnit[] = [
  "HORIZONTAL",
  "INCLINE",
  "SPRING",
  "CIRCULAR",
  "PROJECTILE",
];

export const PROBLEMS: Problem[] = [
  // ===== HORIZONTAL =====
  {
    slug: "horizontal-no-friction",
    unit: "HORIZONTAL",
    title: "なめらかな水平面で押される物体",
    summary:
      "水平な床（摩擦なし）を外力 F で押される物体の運動。運動方程式の最も基本形。",
    tier: "FREE",
    level: "基礎",
    keyInsights: [
      "水平方向には外力 F のみが働く（摩擦がないので）",
      "鉛直方向は垂直抗力 N と重力 mg がつり合う",
      "加速度は a = F/m。F が一定なら等加速度運動",
    ],
    formulas: [
      { title: "水平方向の運動方程式", expr: "m a = F", note: "→ a = F / m" },
      { title: "鉛直方向のつり合い", expr: "N = m g" },
    ],
    misconceptions: [],
    simulation: {
      type: "horizontal",
      params: { force: 20, frictionMu: 0, mass: 1 },
      controllable: [
        { key: "force", label: "外力 F", min: 0, max: 40, step: 1, unit: "N" },
      ],
      arrows: { force: true, velocity: true, acceleration: true },
    },
  },
  {
    slug: "horizontal-with-friction",
    unit: "HORIZONTAL",
    title: "粗い水平面で押される物体",
    summary:
      "水平面に摩擦があるとき、外力 F と摩擦力 μmg のせめぎ合いで加速度が決まる。",
    tier: "FREE",
    level: "標準",
    keyInsights: [
      "動摩擦力は運動方向と逆向き、大きさは μ m g",
      "F ≤ μ m g なら物体は静止（静止摩擦で釣り合う）",
      "F > μ m g なら動き出し、a = (F − μ m g) / m で加速",
    ],
    formulas: [
      { title: "水平方向の運動方程式", expr: "m a = F − μ m g" },
      { title: "鉛直方向のつり合い", expr: "N = m g" },
    ],
    misconceptions: [
      {
        tag: "FRICTION_DIRECTION",
        label: "摩擦力の向き",
        short:
          "摩擦は『外力と逆』ではなく『相対運動と逆』。静止時は外力と釣り合う向き。",
      },
    ],
    simulation: {
      type: "horizontal",
      params: { force: 25, frictionMu: 0.3, mass: 1 },
      controllable: [
        { key: "force", label: "外力 F", min: 0, max: 40, step: 1, unit: "N" },
        { key: "frictionMu", label: "動摩擦係数 μ", min: 0, max: 0.8, step: 0.05 },
      ],
      arrows: { force: true, velocity: true, acceleration: true },
    },
  },

  // ===== INCLINE =====
  {
    slug: "incline-frictionless",
    unit: "INCLINE",
    title: "なめらかな斜面を滑り降りる",
    summary:
      "摩擦のない斜面（傾斜角 θ）を滑り降りる物体。重力の分解と運動方程式の基本。",
    tier: "FREE",
    level: "基礎",
    keyInsights: [
      "重力 mg を斜面方向 (mg sinθ) と斜面垂直方向 (mg cosθ) に分解する",
      "斜面方向の合力 = mg sinθ が運動を駆動する",
      "加速度 a = g sinθ は質量によらない（ガリレオの結果）",
    ],
    formulas: [
      { title: "斜面方向の運動方程式", expr: "m a = m g sinθ", note: "→ a = g sinθ" },
      { title: "斜面垂直方向のつり合い", expr: "N = m g cosθ" },
    ],
    misconceptions: [
      {
        tag: "NORMAL_NOT_VERTICAL_ON_INCLINE",
        label: "重力の描き方",
        short: "重力は鉛直下向きに 1 本。分解は計算上の補助線。",
      },
    ],
    simulation: {
      type: "incline",
      params: { angle: 25, frictionMu: 0, mass: 1 },
      controllable: [
        { key: "angle", label: "傾斜角 θ", min: 5, max: 60, step: 1, unit: "°" },
      ],
      arrows: { force: true, velocity: true, acceleration: true, decomposition: true },
    },
  },
  {
    slug: "incline-with-friction",
    unit: "INCLINE",
    title: "粗い斜面を滑り降りる",
    summary:
      "摩擦のある斜面では、mg sinθ と μ mg cosθ の大小で加速/静止が決まる臨界条件。",
    tier: "FREE",
    level: "標準",
    keyInsights: [
      "運動方程式: m a = mg sinθ − μ m g cosθ",
      "tan θ > μ なら滑る、tan θ ≤ μ なら静止",
      "摩擦力は常に相対運動と逆向き（斜面上向き）",
    ],
    formulas: [
      { title: "斜面方向の運動方程式", expr: "m a = m g sinθ − μ m g cosθ" },
      { title: "滑り出しの条件", expr: "tanθ > μ" },
      { title: "斜面垂直方向のつり合い", expr: "N = m g cosθ" },
    ],
    misconceptions: [
      {
        tag: "FRICTION_DIRECTION",
        label: "摩擦力の向き",
        short: "斜面を下る物体では摩擦は『斜面上向き』。",
      },
    ],
    simulation: {
      type: "incline",
      params: { angle: 25, frictionMu: 0.2, mass: 1 },
      controllable: [
        { key: "angle", label: "傾斜角 θ", min: 5, max: 60, step: 1, unit: "°" },
        { key: "frictionMu", label: "動摩擦係数 μ", min: 0, max: 0.8, step: 0.05 },
      ],
      arrows: { force: true, velocity: true, acceleration: true, decomposition: true },
    },
  },

  // ===== SPRING =====
  {
    slug: "spring-horizontal-shm",
    unit: "SPRING",
    title: "水平ばねの単振動",
    summary:
      "なめらかな水平面でばねにつながれた物体は、振動中心を往復する単振動（SHM）を行う。",
    tier: "FREE",
    level: "標準",
    keyInsights: [
      "弾性力は変位と逆向き、大きさ k x → 復元力",
      "運動方程式 ma = −kx から ω = √(k/m) の単振動",
      "速度と加速度は常に 90° 位相がずれている",
    ],
    formulas: [
      { title: "運動方程式", expr: "m a = − k x" },
      { title: "角振動数", expr: "ω = √(k / m)" },
      { title: "周期", expr: "T = 2π √(m / k)" },
    ],
    misconceptions: [
      {
        tag: "SPRING_DIRECTION",
        label: "弾性力の向き",
        short: "弾性力は『変位と逆向き』。伸びていれば縮ませる向きに働く。",
      },
      {
        tag: "VELOCITY_VS_ACCELERATION",
        label: "速度と加速度",
        short: "端点では速度 0 だが加速度は最大。振動中心では逆。",
      },
    ],
    simulation: {
      type: "spring",
      params: { k: 8, mass: 1, amplitude: 0.35 },
      controllable: [
        { key: "k", label: "ばね定数 k", min: 2, max: 20, step: 1, unit: "N/m" },
        { key: "amplitude", label: "振幅 A", min: 0.1, max: 0.5, step: 0.05 },
      ],
      arrows: { force: true, velocity: true, acceleration: true },
    },
  },
  {
    slug: "spring-vertical-equilibrium",
    unit: "SPRING",
    title: "鉛直ばねと重力の釣り合い",
    summary:
      "天井から吊るしたばねと物体。重力を考慮した新しい釣り合い位置を中心に単振動する。",
    tier: "PRO",
    level: "発展",
    keyInsights: [
      "釣り合い位置は自然長の下に mg/k ずれる",
      "新しい釣り合い位置を中心にすると、方程式は水平ばねと全く同形",
      "鉛直でも ω = √(k/m) は変わらない",
    ],
    formulas: [
      { title: "釣り合い位置のずれ", expr: "x₀ = m g / k" },
      { title: "釣り合い位置中心の変数 y = x − x₀ に対して", expr: "m ÿ = − k y" },
      { title: "角振動数", expr: "ω = √(k / m)" },
    ],
    misconceptions: [
      {
        tag: "SPRING_DIRECTION",
        label: "弾性力の基準",
        short: "鉛直ばねでは、基準点は『自然長』ではなく『新しい釣り合い位置』。",
      },
    ],
    simulation: {
      type: "spring",
      params: { k: 10, mass: 1, amplitude: 0.3 },
      controllable: [
        { key: "k", label: "ばね定数 k", min: 3, max: 25, step: 1, unit: "N/m" },
      ],
      arrows: { force: true, velocity: true, acceleration: true },
    },
  },

  // ===== CIRCULAR =====
  {
    slug: "circular-horizontal",
    unit: "CIRCULAR",
    title: "水平面の等速円運動",
    summary:
      "糸でつながれて水平面を等速円運動する物体。向心力と向心加速度の理解。",
    tier: "FREE",
    level: "標準",
    keyInsights: [
      "速度 v は接線方向（円周に沿う向き）",
      "加速度 a は中心向き（向心加速度）、大きさ v²/R = ω²R",
      "向心力 = 張力 T が中心向きに引く：T = m v²/R",
    ],
    formulas: [
      { title: "向心加速度", expr: "a = v² / R = ω² R" },
      { title: "向心力（＝糸の張力）", expr: "T = m v² / R" },
      { title: "周期", expr: "T_周 = 2π R / v = 2π / ω" },
    ],
    misconceptions: [
      {
        tag: "CENTRIPETAL_OUTWARD",
        label: "向心加速度の向き",
        short: "慣性系では『遠心力』は描かない。合力は中心向き。",
      },
      {
        tag: "VELOCITY_VS_ACCELERATION",
        label: "速度と加速度の向き",
        short: "速度は接線、加速度は中心向き。常に 90° の関係。",
      },
    ],
    simulation: {
      type: "circular",
      // Default ω chosen so one revolution takes roughly 6 s on-screen — slow
      // enough that students can track the velocity / acceleration arrows.
      params: { radius: 0.3, omega: 1.2, mass: 1 },
      controllable: [
        { key: "omega", label: "角速度 ω", min: 0.4, max: 2.4, step: 0.1, unit: "rad/s" },
      ],
      arrows: { force: true, velocity: true, acceleration: true },
    },
  },

  // ===== PROJECTILE =====
  {
    slug: "projectile-oblique",
    unit: "PROJECTILE",
    title: "斜め投射",
    summary:
      "初速 v₀ と角度 θ で投げ上げる物体。空気抵抗を無視すれば、水平方向は等速、鉛直方向は等加速度運動に分解できる。",
    tier: "FREE",
    level: "標準",
    keyInsights: [
      "空中の力は重力 mg のみ（水平方向に力は働かない）",
      "水平方向は等速 v₀ cosθ、鉛直方向は g で減速する等加速度",
      "最高点では鉛直速度 0、水平速度は保持",
    ],
    formulas: [
      { title: "水平方向", expr: "x = v₀ cosθ · t" },
      { title: "鉛直方向", expr: "y = v₀ sinθ · t − (1/2) g t²" },
      { title: "最高点までの時間", expr: "t_頂 = v₀ sinθ / g" },
      { title: "到達距離", expr: "R = v₀² sin(2θ) / g", note: "θ=45° で最大" },
    ],
    misconceptions: [
      {
        tag: "PROJECTILE_HORIZONTAL_FORCE",
        label: "水平方向の力",
        short: "空気抵抗を無視すると、空中での水平方向の力は 0。",
      },
    ],
    simulation: {
      type: "projectile",
      params: { v0: 1.2, launchAngle: 55 },
      controllable: [
        { key: "launchAngle", label: "投射角 θ", min: 10, max: 80, step: 1, unit: "°" },
        { key: "v0", label: "初速 v₀", min: 0.6, max: 2.0, step: 0.05 },
      ],
      arrows: { force: true, velocity: true, acceleration: true, decomposition: true },
    },
  },
  {
    slug: "projectile-cliff",
    unit: "PROJECTILE",
    title: "崖からの水平投射",
    summary:
      "高さ h の崖から水平に v₀ で投げ出された物体。落下時間は高さのみで決まり、v₀ によらない。",
    tier: "PRO",
    level: "発展",
    keyInsights: [
      "落下時間 t は √(2h/g)。初速と無関係",
      "到達距離 x は v₀ √(2h/g)。初速に比例",
      "鉛直方向は自由落下、水平方向は等速の 2 成分分解",
    ],
    formulas: [
      { title: "落下時間", expr: "t = √(2 h / g)" },
      { title: "水平到達距離", expr: "x = v₀ √(2 h / g)" },
      { title: "着地時の鉛直速度", expr: "v_y = g t = √(2 g h)" },
    ],
    misconceptions: [
      {
        tag: "PROJECTILE_HORIZONTAL_FORCE",
        label: "水平方向の力",
        short: "水平投射でも、落下するのは重力だけによる。",
      },
    ],
    simulation: {
      type: "projectile",
      params: { v0: 1.2, launchAngle: 0 },
      controllable: [
        { key: "v0", label: "初速 v₀", min: 0.4, max: 2.0, step: 0.05 },
      ],
      arrows: { force: true, velocity: true, acceleration: true, decomposition: true },
    },
  },
];

export function getProblem(slug: string): Problem | null {
  return PROBLEMS.find((p) => p.slug === slug) ?? null;
}

export function problemsByUnit(): Record<PhysUnit, Problem[]> {
  const out = {} as Record<PhysUnit, Problem[]>;
  for (const u of UNIT_ORDER) out[u] = [];
  for (const p of PROBLEMS) out[p.unit].push(p);
  return out;
}
