## Node.js /主要ライブラリ アップデート影響範囲調査（2026-03）

### 現状の棚卸し（package.json / npm outdated）
- ルート `package.json` の `engines.node`: `18.x`
- `client/package.json` の `engines.node`: `18.x`
- `npm view node dist-tags` より `latest LTS`: `v20-lts@20.11.1`
- `npm outdated --json`（ルート/`client/`）より主な乖離は以下
  - `express`: wanted `4.22.1` -> latest `5.2.1`
  - `react`: wanted `17.0.2` -> latest `19.2.4`
  - `react-dom`: wanted `17.0.2` -> latest `19.2.4`
  - `react-router-dom`: wanted `5.3.4` -> latest `7.13.2`
  - `typescript`: wanted `4.9.5` -> latest `6.0.2`

### アップデート対象: 現在 vX -> 目標 vY
- `Node.js`: `18.x` -> `20.11.1`（最新 LTS）
- `express`: `4.21.2` -> `5.2.1`
- `react`: `17.0.2` -> `19.2.4`
- `react-dom`: `17.0.2` -> `19.2.4`
- `react-router-dom`: `5.3.4` -> `7.13.2`
- `typescript`: `4.9.5` -> `6.0.2`
- `@types/node`（client）: `12.20.55` -> `25.5.0`
- `@types/react`（client）: `17.0.91` -> `19.2.14`

### リスクが高いコンポーネント/モジュール（Serena で該当箇所検出）
- `client/src/index.tsx`（`ReactDOM.render`）
- `client/src/Route/BudgetAppRouter.tsx`（`Switch`, `Route` v5 API）
- `client/src/Route/AuthenticatedRoute.tsx`（`Switch`, `Route exact`/配列パス）
- `client/src/Components/Monthly.tsx`（`useHistory`）
- `client/src/Components/Login.tsx`（`useHistory` + `history.push`）
- `client/src/Components/Layout/Column/MainColumn.tsx`（`Switch`, `Route exact`, `Route component`）
- `client/src/Guard/AuthenticatedGuard.tsx`（`Redirect`）
- `client/src/Guard/AuthenticationGuard.tsx`（`Redirect`）
- `api/src/index.ts`（Express ルーティングラッパ、型 `next: Function`、`body-parser` 使用）
- `api/src/controller/BudgetController.ts`（`express` 型 `Request/Response/NextFunction`）
- `api/src/controller/UserController.ts`（`express` 型 `Request/Response/NextFunction`）

### 懸念事項（Breaking/Deprecated 候補）
- `react-router-dom` が v5 -> v7 に上がるため、以下はコンパイルエラー/実装変更が確実に発生し得る
  - `Switch` が無くなり `Routes` に移行が必要
  - `useHistory` が無くなり `useNavigate` 等への置換が必要
  - `Redirect` が無くなり `Navigate` への移行が必要
  - `Route` の API（`exact`、`component` prop、`to` の形など）が変更され、型定義により失敗する可能性あり
- `ReactDOM.render` は legacy API のため、React 17 -> 19 で非推奨/互換性低下のリスクがある
  - エントリは `createRoot`（`react-dom/client`）への移行が望ましい（少なくともビルド/型周りで警告・失敗を起こす可能性あり）
- Express 4 -> 5 でルーティング型の整合が崩れる可能性がある
  - `api/src/index.ts` では `next: Function` を使っており、Express 5 の型に合わせて `NextFunction` 想定へ修正が必要になる可能性
- TypeScript 4.9 -> 6.0 で型定義が更新され、`strict: true` の `client/tsconfig.json` 上で React/Router/Express 型の不整合が顕在化する可能性あり
- `client/package.json` の `@types/node` が `12.x` と非常に古く、Node.js を v20 系へ上げる場合は型の整合（`@types/node` 更新）が必要
- Prisma について
  - ルート/`client/` の `package.json` に Prisma 依存は見つからず、コード内でも `PrismaClient` / `@prisma/client` は検出されなかったため、今回の調査対象からは除外可能

### 追加ノート（調査範囲と限界）
- 影響範囲は「Serena で特定できた削除/移行系API（React Router v5→v7、ReactDOM.render、Express handler signature など）」を中心に整理した。
- ここに無い箇所でも、メジャーアップデートに伴う型/依存の変更は追加で発生し得るため、アップデート着手前に `tsc` / `eslint` / `tests` 実行で差分確認が必要。

