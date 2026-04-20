import { MisconceptionTag } from "@/types/analysis";

export interface MisconceptionInfo {
  label: string;
  short: string;
  deep: string;
}

export const MISCONCEPTIONS: Record<MisconceptionTag, MisconceptionInfo> = {
  FRICTION_DIRECTION: {
    label: "摩擦力の向き",
    short:
      "摩擦力は『運動方向の逆』ではなく、『相対的に動こうとする向きに逆らう』方向に働く。",
    deep: "静止摩擦のときは外力と釣り合う向き、動摩擦のときは相対運動と逆向き。斜面上で静止していても、滑り出そうとする向きの逆に摩擦が発生する。",
  },
  NORMAL_NOT_VERTICAL_ON_INCLINE: {
    label: "斜面上の重力の分解",
    short:
      "斜面上でも重力は鉛直下向き。斜面方向に分解した成分と混同しない。",
    deep: "図に描くのは鉛直下向きの mg 1本。式を立てる時に『斜面方向=mg sinθ』『斜面垂直方向=mg cosθ』に分解する。最初から分解した矢印だけを描くと垂直抗力との関係が見えなくなる。",
  },
  VELOCITY_VS_ACCELERATION: {
    label: "速度と加速度の区別",
    short: "速度と加速度は向きが同じとは限らない。減速中は逆向き。",
    deep: "加速度は『速度の変化の向き』。投げ上げた物体が上昇中でも加速度は下向き (重力) のまま。円運動なら速度は接線、加速度は中心向き。",
  },
  ACTION_REACTION_SAME_BODY: {
    label: "作用反作用の描き分け",
    short:
      "作用反作用の2本は『別の物体』にそれぞれ働く力。同じ物体に2本描かない。",
    deep: "例: 人が床を押す力は床に働く。床が人を押し返す力は人に働く。自由物体図 (FBD) は1つの物体に働く力だけを描く。",
  },
  CENTRIPETAL_OUTWARD: {
    label: "向心加速度の向き",
    short: "向心加速度・向心力は中心向き。外向きの遠心力を FBD に描かない。",
    deep: "慣性系で円運動を扱うときは、合力が中心向きで、それが向心力。『遠心力』は回転系で見たときの見かけの力で、通常の問題では描かない。",
  },
  PROJECTILE_HORIZONTAL_FORCE: {
    label: "投射中の水平方向の力",
    short:
      "空気抵抗を無視する投射運動では、水平方向に力は働かない (重力のみ)。",
    deep: "投射運動の FBD に『進行方向の力』を描いてしまうのは典型的な誤解。加速度は常に下向き g、水平方向の速度は一定。",
  },
  SPRING_DIRECTION: {
    label: "弾性力の向き",
    short:
      "ばねが伸びていれば自然長に戻す向き、縮んでいれば反対向きに押し返す。",
    deep: "弾性力 F = -kx は『変位と逆向き』。図で向きを決めるときは、自然長からどちらにずれているかを確認してから矢印を引く。",
  },
  GRAVITY_MAGNITUDE: {
    label: "重力の描き方",
    short: "重力は常に鉛直下向きに mg 1本。斜面でも水中でも向きは変わらない。",
    deep: "重力の矢印は物体の重心から鉛直下向きに。長さは mg に比例させると、力の分解のときに他の力と比較しやすい。",
  },
};
