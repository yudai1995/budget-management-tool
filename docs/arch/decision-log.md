# アーキテクチャ決定記録（Architecture Decision Log）

> 設計上の重要な決定とその根拠を記録する。変更時は新エントリを追記し、既存エントリは削除しない。

---

## ADR-001: デザイントークンの強制とマジックナンバーの禁止

**日付**: 2026-04-12
**ステータス**: 採用

### 決定
- 色・スペーシング・ボーダー半径などすべてのデザイン値を CSS 変数（`--color-*`, `--spacing-*`, `--radius-*`）として定義する
- Tailwind CSS の `extend` ブロックでこれらの CSS 変数を参照する
- ソースコード内への直接的な色コード・px 値の記述を禁止する

### 背景
- デザインと実装の乖離が時間とともに拡大し、UI の一貫性が失われる問題が生じた
- Figma 上のデザイン変更をコードに手動で反映する作業コストが高かった

### 理由
- CSS 変数を SSOT（Single Source of Truth）とすることで、`scripts/sync-tokens.ts` による自動変換が機能する
- Figma Variables → CSS 変数 → Tailwind トークン のパイプラインが確立され、デザイン変更が自動でコードに伝播する
- Lefthook の pre-commit フックでトークン同期チェックを強制し、人的ミスを排除する

### 影響
- 新規コンポーネント作成時は必ず Tailwind トークンクラスを使用する
- ハードコードされた値が PR レビューで検出された場合、マージを拒否する

---

## ADR-002: バックエンド API の SSOT をコード（Route定義）に置く

**日付**: 2026-04-12
**ステータス**: 採用

### 決定
- `@hono/zod-openapi` の `createRoute()` をすべての API エンドポイントの唯一の定義場所とする
- `openapi.yaml` は `generate:openapi` スクリプトで自動生成される成果物であり、手動編集を禁止する
- `app.get()` 等の標準メソッド使用を禁止し、`app.openapi()` のみを使用する

### 背景
- YAML ファイルをコードと別管理すると、実装と仕様の乖離が発生しやすい
- レビュー時にどちらが正しいか判断が困難になる問題があった

### 理由
- `createRoute()` の `summary`, `description`, `request`, `responses` が型レベルで必須化されることで、ドキュメント漏れが型エラーとして検出される
- Lefthook の `openapi-sync` チェックにより、スペック未更新のコミットが物理的に不可能になる
- `packages/api-spec/openapi.yaml` → `openapi-typescript` → `packages/api-client/src/schema.d.ts` のパイプラインで型安全なクライアントコードが自動生成される

### 影響
- ルート追加・変更時は `generate:openapi` の実行が必須（Lefthook が強制）
- `openapi.yaml` を直接編集した場合、次回コミット時の差分チェックで検出される

---

## ADR-003: フロントエンドの HTTP クライアントに openapi-fetch を採用

**日付**: 2026-04-12
**ステータス**: 採用

### 決定
- `packages/api-client` は `openapi-fetch` + `openapi-typescript` 生成型を使用する
- Orval によるクライアント自動生成は採用しない（現時点）

### 背景
- フロントエンドが API の型定義に強く依存する構造を確立したい
- 生成コードの可読性・カスタマイズ性のバランスが必要

### 理由
- `openapi-typescript` は型定義のみを生成し、実際の HTTP 呼び出しコードは `openapi-fetch` が担う
- 生成される `schema.d.ts` は型定義のみであるため、カスタムロジックを共存させやすい
- `pnpm codegen` コマンド1つで `openapi.yaml` → 型定義 → ビルドまで完結する

### 将来的な拡張
- Orval への移行は、React Query / SWR との統合が必要になった時点で検討する

---

## ADR-004: モノリポのパッケージ構成

**日付**: 2026-04-12
**ステータス**: 採用

### 決定
```
apps/
  api/          # Hono バックエンド
  web/          # Next.js フロントエンド
packages/
  common/       # FE/BE 共用型定義・ユーティリティ
  api-spec/     # 生成された openapi.yaml（成果物）
  api-client/   # openapi-fetch クライアント + 生成型
```

### 依存関係の方向
```
web → api-client → api-spec ← api
web → common ← api
```

- `api-spec` は `api` が生成し、`api-client` と `web` が参照する
- `common` はドメイン型を共有するが、UI・インフラの詳細を含まない
