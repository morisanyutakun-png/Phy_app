# Arrow Physics

**図で止まる物理を、矢印でわかる。**

高校物理（力学）の問題図をアップロードすると、力・速度・加速度の矢印候補を図の上に重ねて表示し、「正しい / 不要 / 向き違い」を自分で判定しながら誤解を訂正できる学習アプリです。Next.js (App Router) 単体で完結し、Vercel にそのままデプロイできます。

## 特徴

- 力学 5 単元（水平面 / 斜面 / ばね / 円運動 / 投射）に特化
- 画像 → 矢印候補 JSON を Claude vision で生成
- SVG 矢印オーバーレイで正誤判定（足りない矢印を自分で描き足すことも可能）
- 誤解タグ（摩擦の向き、向心加速度、速度と加速度の混同など）を履歴に自動保存
- 立式ヒント（運動方程式 / 向心力 / エネルギー保存 など）で図から式へ橋渡し
- フリーミアム制御（1 日 3 問の無料枠 + Pro 月額）
- Stripe の Checkout / Billing Portal / Webhook まで Next.js 内で完結

## 技術スタック

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Vercel Blob（画像保存）
- Anthropic Claude API（`claude-sonnet-4-6`）
- Stripe
- 認証: 自前 JWT（`jose`）+ bcrypt（Edge 対応）

## 画面

| ルート                 | 説明                                               |
| ---------------------- | -------------------------------------------------- |
| `/`                    | LP（ヒーロー + サンプル + CTA）                   |
| `/register`, `/login`  | 認証                                               |
| `/dashboard`           | 使用状況 / 最近の履歴 / 苦手傾向 / おすすめ単元    |
| `/upload`              | 画像アップロード + お試し問題                       |
| `/analysis/[id]`       | 矢印オーバーレイ + 判定 UI + 誤解訂正 + 立式ヒント |
| `/history`             | 単元フィルタ付きの履歴一覧                         |
| `/pricing`             | 料金ページ + Checkout / Portal 導線                |
| `/demo/[sampleId]`     | ログイン不要のサンプル体験                         |

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. `.env` を作る

`.env.example` をコピーして値を埋めます。

```bash
cp .env.example .env
```

最低限ローカルで動かすのに必要なのは:

| キー                    | 説明                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL 接続文字列（Neon / Supabase / Vercel Postgres など）                                |
| `AUTH_SECRET`           | `openssl rand -base64 32` で作る 32 文字以上のランダム文字列                                    |
| `ANTHROPIC_API_KEY`     | Claude 用 API キー。未設定かつ `DEMO_MODE_FALLBACK=true` なら固定のサンプル解析で動きます      |
| `NEXT_PUBLIC_APP_URL`   | 例: `http://localhost:3000`                                                                    |
| `DEMO_MODE_FALLBACK`    | `true` にすると API キー未設定でもフローが止まらず、デモ解析が返る（初回セットアップ時に便利） |

### 3. DB をセットアップ

```bash
npm run db:push       # schema を反映
npm run db:seed       # デモユーザー + サンプル履歴を投入（任意）
```

シードで作成されるデモアカウント:

- メール: `demo@arrowphysics.app`
- パスワード: `demo1234`
- プラン: PRO

### 4. 起動

```bash
npm run dev
```

<http://localhost:3000> にアクセス。API キーや Blob、Stripe が未設定でも LP / ログイン / `demo/[sampleId]` は動きます。

## 本番環境（Vercel）

### 1. Vercel プロジェクトを作成して接続

リポジトリを GitHub にプッシュして Vercel の Import から追加するだけでビルドが通ります（`postinstall` で `prisma generate` されます）。

### 2. Postgres を用意

- Vercel Postgres を Storage タブから作成する、または Neon / Supabase の URL を `DATABASE_URL` に設定。
- 初回デプロイ後、ローカルから本番 DB に向けて `DATABASE_URL=... npm run db:push` を実行するのが簡単です。

### 3. Vercel Blob

- プロジェクトの Storage → Blob から Store を作成し、トークン `BLOB_READ_WRITE_TOKEN` を環境変数に追加。
- 未設定時のフォールバックとして、ローカル開発では画像を Base64 data URL として扱うようになっています（本番は必ず Blob を設定してください）。

### 4. Stripe

1. Stripe ダッシュボードで商品（Pro プラン、月額サブスク）を作成し、Price ID を取得。
2. 以下の環境変数を Vercel に設定:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID_PRO`
   - `STRIPE_WEBHOOK_SECRET`
3. Webhook エンドポイントを次の URL で追加:
   `https://<your-domain>/api/stripe/webhook`
   受信イベント: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Billing Portal を有効化（Settings → Billing → Customer portal）。

### 5. Anthropic API

`ANTHROPIC_API_KEY` を Vercel に追加。モデルは `claude-sonnet-4-6` を既定で使用します。

## 主要ディレクトリ

```
app/
  (auth)/login, register          # 認証画面
  (app)/dashboard, upload,        # ログイン必須のアプリ画面
        analysis/[id], history,
        pricing
  api/
    auth/{login,register,logout}
    upload                         # Vercel Blob へのアップロード
    analyze                        # Claude vision 呼び出し + DB 保存
    feedback                       # 矢印判定結果の保存
    stripe/{checkout,portal,webhook}
  demo/[sampleId]                  # ログイン不要のサンプル
components/
  ArrowOverlay.tsx                 # 画像に矢印を重ねる SVG コンポーネント
  AnalysisView.tsx                 # 判定 UI + 立式タブ + フィードバック
  UploadForm.tsx, AppHeader.tsx, PlanButtons.tsx, Logo.tsx
lib/
  ai/{prompt,analyze,demo}         # Claude 呼び出し + JSON サニタイズ
  auth/{session,user}              # JWT セッション + bcrypt
  db.ts, limits.ts, misconceptions.ts, samples.ts, stripe.ts, cn.ts
prisma/
  schema.prisma
  seed.ts
types/analysis.ts
```

## AI への内部プロンプト

`lib/ai/prompt.ts` で日本の高校物理（力学）の文脈を明示し、`AnalysisResult` スキーマに厳密に従う JSON のみを返すよう指示しています。Claude からの返答は `lib/ai/analyze.ts` の `sanitizeResult` で型安全に整え、壊れた JSON が来た場合も `DEMO_MODE_FALLBACK=true` のときはサンプル解析を返してフローが止まらないようにしています。

## フリーミアム制御

- 1 日の解析回数は `UsageDaily` テーブル（JST 日付単位）で管理します。
- `FREE` プラン: 3 問 / 日、履歴は直近 10 件のみ。
- `PRO` プラン: 200 問 / 日（実質無制限）、全履歴、詳細な誤解訂正。
- 解析時に上限を超えると API は `429 LIMIT_REACHED` を返し、UI は `/pricing?reason=limit` に遷移します。

## 今後の拡張案

- 類題提案（誤解タグから弱点を突く問題を並べる）
- ユーザーが自分でラベル付きの矢印を複数描けるフリーハンドキャンバス
- 動画 / 多画面解析（現状の MVP は静止画）
- 教師ダッシュボード（クラス単位の苦手集計）
- 電磁気・熱・波動への単元拡張
- オフライン対応（PWA）
- 共通テスト過去問データセットとの突き合わせ

## ライセンス

© Arrow Physics. All rights reserved.
