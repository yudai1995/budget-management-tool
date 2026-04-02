## Next.js(App Router) + 独立 API(Express) への移行計画（案）2026-03-30

### 目的
- フロントを `Next.js (App Router)` に移行し、UI ルーティング/SSR/サーバーサイド連携を Next に寄せる
- バックエンド `Express` は `データ提供(API)` に寄せ、`client/build` への依存を排除して疎結合化する

このドキュメントは計画のための調査結果と設計案であり、ディレクトリ作成・インストール・コード修正は行いません。

---

## 1. 現状分析と構成案の提示

### 1.1 Monorepo 化（検討案）
既存はトップに `api/`、`client/` が別ディレクトリで存在します。疎結合化と同時に移行速度を上げるため、モノレポ化は有効です。

おすすめ: `Turborepo`（または同等の Workspaces）
- `apps/` 配下に `api` と `next-app` を置き、`packages/` に共有（型・DTO・バリデーション・API クライアント）を切り出す
- 共通の lint/tsconfig/eslint 設定・依存の重複を抑える

モノレポ採用時のツリー（後段 4.2 の図と同一）
- `apps/api`: Express (Node 20)
- `apps/web`: Next.js 15+ (App Router)
- `packages/shared`: 型・DTO、認証ユーティリティ（必要に応じて）

---

### 1.2 API サーバーの役割定義（Server Actions vs Express）

#### Server Actions で代替（Next 側に寄せる）べきもの（基準）
- UI 操作に密結合で、Next のコンテキスト（`headers/cookies`、リダイレクト、フォーム送信後の画面遷移）を使うことに価値がある処理
- 「ドメイン/永続化」よりも「UI オーケストレーション」が中心の処理（例: 入力値のクライアント/サーバー側バリデーション、画面遷移・表示制御）

#### Express に残す（データ提供専用にする）べきもの（基準）
- DB アクセスを含む CRUD（`/api/budget`, `/api/user` など）
- 認証/認可（`/api/login`, `/api/logout`、セッション管理）
- API を別クライアント（将来の別フロント/モバイル等）でも利用できる形で提供したい処理

#### 重要な制約（認証 Cookie + Server Actions）
- 現状の認証は `express-session` による Cookie セッションです。
- **Server Actions から Express を呼ぶだけ**だと、Express が発行する `Set-Cookie` をブラウザへ正しく反映するのが難しいケースがあります。
- そのため、ログイン/ログアウトのように Cookie 発行が関わる処理は次のいずれかを推奨します。
  - ブラウザ側（Client Component）で Express API を呼ぶ（credentials 付き）
  - または Next 側に「プロキシ」（`app/api/*` route handler など）を作り、応答ヘッダ（Set-Cookie）を正しく転送する

---

## 2. API（Express）の切り出し計画

### 2.1 FE との密結合スキャン結果（Serena）
Express が `client/build` を静的配信しており、これが疎結合化の第一の障害です。

該当箇所（高優先で分離対象）
- `api/src/index.ts`
  - `res.sendFile(path.join(__dirname, '../../client/build/index.html'))`
  - `app.use(express.static(path.join(__dirname, '../../client/build')), ...)`
  - `router.get('/api'...)`, `router.get('/api/*'...)`, `router.get('*'...)` のフォールバックで `client/build` を返している

切り出し方針
- Express は API エンドポイントのみ提供し、SPA の配信/フォールバック（`client/build`）は Next に移す
- Next 側は `app/not-found.tsx` 等で 404 を制御

---

### 2.2 現状の API ルート定義
ルートは `api/src/routes.ts` に集約されています。
- `GET /api/budget`
- `GET /api/budget/:id`
- `POST /api/budget`
- `PUT /api/budget/:id`
- `DELETE /api/budget/:id`
- `GET /api/user`
- `GET /api/user/:userId`
- `POST /api/user`
- `PUT /api/user/:userId`
- `DELETE /api/user/:userId`
- `POST /api/login`
- `POST /api/logout`

---

### 2.3 CORS 設定の更新ポイント（現状）
Serena 上のスキャンでは `cors` 実装は検出されませんでした（CORS 未対応の前提）。

切り出しに伴い必要になる修正ポイント
- **Next.js との別オリジン構成**にする場合：
  - Express に `cors` ミドルウェアを追加
  - `credentials: true` を有効化
  - `origin` を Next の実オリジン（例: `http://localhost:3000`）に限定

---

### 2.4 認証（Cookie）の引き継ぎ修正ポイント
認証は `express-session` により Cookie セッションを利用しています。

現状（リスク）
- `cookie` オプションに `sameSite` が明示されていないため、クロスオリジン移行時に挙動が破綻しやすい
- `secure` は本番時に `trust proxy` が有効な場合のみ `true` に寄せているが、`sameSite=None` を使う場合は `secure=true` が必須になる

必要な方針決定（移行前に確定推奨）
- Next と Express の配置をどうするか：
  - 同一オリジン（リバースプロキシ/rewrites）にする -> CORS 問題を実質回避しやすい
  - 別オリジンにする -> Express 側 CORS + Cookie `sameSite/secure` 設計が必須

推奨オプション（難易度低）
- Next 側で `/api/*` を Express に転送（`rewrites` や API route proxy）
- これにより Cookie を「ブラウザの同一オリジンの Cookie」として扱いやすくなり、移行の事故率が下がる

---

## 3. Next.js プロジェクト初期化（Scaffolding）

### 3.1 `next-app` 初期化コマンド案（Next.js 15+ / App Router / TS / Tailwind）
最初の足場として、以下のような作成方針を推奨します（実行はユーザー承認後）。

例（`create-next-app`）
```bash
npx create-next-app@latest next-app --ts --tailwind --app --src-dir --eslint
```

追加で Tailwind を利用する前提で、Lucide React を導入
```bash
npm i lucide-react
```

---

### 3.2 ルーティング設計（既存パスの対応表）
React Router v5 の現在の主要ルートを Next App Router に割り当てます（案）。
- `/login` -> `app/login/page.tsx`
- `/` と `/monthly` -> `app/(main)/page.tsx` または `app/monthly/page.tsx`（どちらかに寄せて redirect でも可）
- `/report` -> `app/report/page.tsx`
- `/report/:date` -> `app/report/[date]/page.tsx`
- `/edit`（現状は `history.push('/edit', { state: { date } })`）-> 次のどちらかに変更
  - 推奨: `/edit/[date]`（例: `2026-03-30`）-> `app/edit/[date]/page.tsx`
  - 代替: `/edit?date=...` -> `app/edit/page.tsx` + `searchParams`

`NotFound` 相当
- `client/src/Components/NotFound.tsx` -> `app/not-found.tsx`

`/about` リダイレクト
- 現状 `AuthenticatedGuard` は `/about` へ redirect していますが、現行のルート一覧には見当たりません
- Next 側では一旦 `/` へ寄せる（または `about` を新設する）方針を検討

---

### 3.3 データ取得・API 呼び出し方式
疎結合化後の FE -> Express 呼び出し方式は次のどちらかを推奨します。

推奨（事故率低）
- Next 側で `/api/*` を Express に転送（同一オリジン運用）
- FE は従来通り `/api/...` を呼び、CORS/Cookie 設計を最小化

代替（別オリジン運用）
- `NEXT_PUBLIC_API_BASE_URL` を使い、`fetch`/`axios` を絶対 URL で呼ぶ
- その場合は Express に CORS + credentials 設計が必要

---

## 3.4 既存 `client/src` の移植分類（コピー vs 書換）

### A. そのままコピーできる（またはほぼ同じで移植可能）候補
- ルーティング/履歴依存がない、純粋な UI コンポーネント
- モデル（`client/src/Model/*`）のようにロジック中心のもの（ただし import パス調整は必要）

例（概念カテゴリ）
- `Components/Graph/*`
- `Components/Report/*`（ただし `Link` や `useLocation` を使っているものは除外）
- `Components/Layout/*`（ただし Router 依存のラッパは除外）
- `Model/*`（DTO/計算ロジック中心）

### B. Next.js 向けに全面書き換えが必要（または実質必須）のロジック
1. エントリ/ルーティング基盤
   - `client/src/index.tsx`（`ReactDOM.render`）-> Next の `app/layout.tsx` / `app/page.tsx` へ置き換え
   - `client/src/App.tsx`（`BrowserRouter`）-> Next の App Router に置き換え
2. Router 依存コンポーネント（react-router-dom）
   - `client/src/Route/BudgetAppRouter.tsx`（`Switch`, `Route`）
   - `client/src/Route/AuthenticatedRoute.tsx`（`Switch`, `Route exact` 等）
   - `client/src/Components/Monthly.tsx`（`useHistory`, `history.push`）
   - `client/src/Components/Login.tsx`（`useHistory`, `history.push`）
   - `client/src/Components/NotFound.tsx`（`useHistory`）
   - `client/src/Components/Layout/Column/MainColumn.tsx`（`Switch`, `Route exact`, `Route component`）
   - `client/src/Components/SimpleInputForm.tsx`（`Link`）
   - `client/src/Components/Header.tsx`（`NavLink`）
   - `client/src/Components/Report/RecentReport.tsx`（`Link`）
   - `client/src/Components/Report/DailyReport.tsx`（`useLocation`）
   - `client/src/Components/Layout/GrobalNaviList.tsx`（`NavLink`）
   - `client/src/Guard/AuthenticatedGuard.tsx`（`Redirect` + location）
   - `client/src/Guard/AuthenticationGuard.tsx`（`Redirect`）
3. `react-router` 依存（`useLocation`）
   - `client/src/Components/Edit.tsx`（`useLocation` + `location.state`）-> Next の `params/searchParams` で date を受ける設計に変更が必要

### C. Redux/axios の扱い（移行戦略の提案）
- 現状は Redux をクライアントで利用しています（`react-redux`）。
- Next App Router では、当面の移行を優先するなら
  - Redux Provider/主要ページは `use client` に寄せる（CSR 優先の段階移行）
  - SSR に寄せるのは次フェーズ（認証 Cookie を絡めるため難易度が上がる）
- axios は現状 `'/api/*'` 相対パス前提なので、Next 側 proxy/rewrites が整うまでは API base の設計が必要です。

---

## 4. 実行アクション

### 4.1 `docs/migration_to_nextjs_plan.md` にまとめ済み

### 4.2 モノレポ構成のディレクトリツリー図（案）
```text
budget-management-tool/
  package.json
  turbo.json
  tsconfig.base.json
  apps/
    api/
      package.json
      tsconfig.json
      src/
        index.ts
        routes.ts
        controller/
        entity/
        model/
    web/
      package.json
      next.config.js
      tailwind.config.{js,ts}
      postcss.config.{js,ts}
      app/
        layout.tsx
        page.tsx
        login/
          page.tsx
        report/
          page.tsx
          [date]/
            page.tsx
        edit/
          [date]/
            page.tsx
        api/
          (proxy routes など)
        not-found.tsx
      src/
        app/ (optional)
        components/
        stores/
  packages/
    shared/
      types/
      dto/
      validation/
    api-client/
      (typed fetch helpers)
```

### 4.3 最初に着手すべきタスクリスト（API サーバー: Node.js 20 化 + 型修正）
優先度順に「型が先に通る状態」を作り、次フェーズで依存や疎結合化の本丸へ進めます。

1. `apps/api`（または現状 `api/`）の Node 20 対応
   - `engines.node` を `20.x` に変更
   - 依存の Node 20 対応を確認し、`npm install` の影響範囲を制御
2. TypeScript/型定義の整合
   - 既存 `api/tsconfig.json` を現行スタイルのまま維持しつつ、型エラー箇所を潰す（最小修正方針）
   - `@types/node` の更新（必要なら `types` 解決を追加）
3. express-session の型補強（必須）
   - `req.session.login` を使っているため、`SessionData` へ `login` を追加する `d.ts` を用意
   - 例: `api/src/types/express-session.d.ts`（`declare module 'express-session' { ... }`）
4. Express 5 互換の型修正（可能なら同時に）
   - `api/src/index.ts` の handler 引数で `next: Function` を `next: NextFunction` に寄せる
   - `next` の型が不要ならシグネチャから削る（関数呼び出し側の型が通る最小の形に）
5. ビルド/型チェックのゲート確立
   - `npm run build`（`tsc`）を通し、`ts-node` 実行も確認する
   - ここで初めてサーバーの疎結合化（`client/build` の削除）へ着手する

---

## 補足（今後の意思決定ポイント）
- 「Next と Express を別オリジンにするか、同一オリジン（proxy/rewrites）にするか」
- Server Actions をログイン/ログアウトに使うかどうか（Cookie 転送の難易度）
- 移行初期の Redux を CSR 前提にするか、SSR に寄せるか

