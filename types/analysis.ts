// Shared types for analysis results and arrows.
// All positions are in normalized image coordinates [0, 1].

export type ArrowType = "force" | "velocity" | "acceleration";

export type PhysicsUnit =
  | "HORIZONTAL"
  | "INCLINE"
  | "SPRING"
  | "CIRCULAR"
  | "PROJECTILE"
  | "UNKNOWN";

export interface Vec2 {
  x: number;
  y: number;
}

export interface PhysObject {
  id: string;
  label: string;
  anchor: Vec2;
  note?: string;
}

export interface ArrowCandidate {
  id: string;
  objectId: string;
  type: ArrowType;
  /** Human-friendly label like "重力", "垂直抗力", "摩擦力", "速度", "向心加速度" */
  label: string;
  /** Normalized start point of the arrow tail */
  from: Vec2;
  /** Normalized end point of the arrow head */
  to: Vec2;
  /** Why this arrow exists (for the student) */
  reason: string;
  /** 0..1 */
  confidence: number;
  /** If the AI thinks a beginner is likely to draw the wrong version of this,
   *  list the common misconception tag(s). */
  commonMistakes?: MisconceptionTag[];
  /** Optional: alternative correct form, used for "wrong direction" coaching. */
  alternate?: { from: Vec2; to: Vec2; reason: string };
  /** True when this arrow is a decomposition (e.g. mg sinθ / mg cosθ) rather
   *  than an independent force. Rendered dashed to signal the distinction. */
  isComponent?: boolean;
  /** Optional id of the arrow this is a component of (e.g. "g" for mg). */
  componentOf?: string;
}

export type MisconceptionTag =
  | "FRICTION_DIRECTION"
  | "NORMAL_NOT_VERTICAL_ON_INCLINE"
  | "VELOCITY_VS_ACCELERATION"
  | "ACTION_REACTION_SAME_BODY"
  | "CENTRIPETAL_OUTWARD"
  | "PROJECTILE_HORIZONTAL_FORCE"
  | "SPRING_DIRECTION"
  | "GRAVITY_MAGNITUDE";

export interface FormulaHint {
  /** Short title like "運動方程式を x 方向に立てる" */
  title: string;
  /** One-line description */
  description: string;
  /** LaTeX-ish, plain text equations are fine for MVP */
  expression?: string;
}

export interface AnalysisResult {
  unit: PhysicsUnit;
  title?: string;
  summary: string;
  objects: PhysObject[];
  arrows: ArrowCandidate[];
  formulaHints: FormulaHint[];
  /** Coaching lines tied to specific misconception tags */
  coachingNotes: Array<{
    tag: MisconceptionTag;
    note: string;
  }>;
}

// ---- UI-side enriched types ----
export type ArrowJudgment =
  | "CORRECT"
  | "UNNECESSARY"
  | "WRONG_DIRECTION"
  | "USER_ADDED";

export interface UserDrawnArrow {
  id: string;
  objectId: string | null;
  type: ArrowType;
  label: string;
  from: Vec2;
  to: Vec2;
}
