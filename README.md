# 家計簿管理ツール（モノレポ）

ローカル開発は `pnpm` + `Turborepo` + `Docker（MySQL）` で完結します。

## 前提条件

- Node.js 20 以上
- pnpm 10 以上
- Docker / Docker Desktop

## クイックスタート

1. 依存関係をインストールする

```bash
pnpm install
```

2. `.env` を作成する（まだない場合）

```bash
cp .env.example .env
```

3. データベースを起動する

```bash
docker compose up -d
```

4. 全アプリを一括起動する

```bash
pnpm dev
```

### 起動先の URL

- フロント（Next.js）: `http://localhost:3000`
- API（Express）: `http://localhost:3001`
- サンドボックス（Vite）: `http://localhost:5173`
- MySQL: `localhost:3306`

## 環境変数の設定

`.env.example` をコピーして `.env` を作成してください。

```bash
cp .env.example .env
```

主な変数の意味:

- `DB_HOSTNAME` … 接続先ホスト（例: `127.0.0.1`）
- `DB_PORT` … ポート（例: `3306`）
- `DB_NAME` … データベース名
- `DB_USER` … DB ユーザー名
- `DB_PASSWORD` … DB パスワード
- `SESSION_KEY` … セッション用シークレット
- `GUEST_PASSWORD` … ゲストログイン用パスワード
- `TZ` … タイムゾーン

## Docker Compose（MySQL 8.0）

`docker-compose.yml` で `db` サービスとして MySQL 8.0 を定義しています。

- 公開ポート: `3306:3306`
- データ永続化: `mysql-data-volume`
- MySQL 設定ファイル: `./mysql/my.cnf`
- 初回起動時に流す SQL のマウント先: `./mysql/init` → コンテナ内 `/docker-entrypoint-initdb.d`

初期化用の SQL は `mysql/init/` に置いてください（**初回コンテナ作成時のみ**実行されます）。

## API 起動時の DB 待機

`apps/api` では、DB のポートが応答するまで `wait-on` で待ってから起動します。

- 定義場所: `apps/api/package.json` の `dev` スクリプト
- 内容のイメージ: `wait-on tcp:${DB_HOSTNAME:-127.0.0.1}:${DB_PORT:-3306}` のあとに `ts-node` で API を起動

## ディレクトリ構成の目安

```text
.
├── apps
│   ├── api       … Express + TypeORM（バックエンド API）
│   ├── web       … Next.js（App Router）
│   └── sandbox   … Vite + React + TypeScript（移行検証用）
├── docs          … ドキュメント
├── mysql
│   ├── init      … 初回 DB 初期化用 SQL
│   └── my.cnf    … MySQL 設定
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

## テスト

### テスト構成（テストピラミッド）

```
          ┌──────────────────────┐
          │   E2E（Playwright）  │  ← ブラウザ操作を伴うユーザー操作全行程
          ├──────────────────────┤
          │  統合テスト（実 DB） │  ← Supertest + TypeORM（API ↔ DB 貫通）
          ├──────────────────────┤
          │   API テスト（モック）│  ← Supertest + コントローラモック
          ├──────────────────────┤
          │ ユニット・コンポーネント │ ← Vitest / RTL（モック）
          └──────────────────────┘
```

| レイヤー | コマンド | 実行時間の目安 | DB 要否 |
|---|---|---|---|
| ユニット・コンポーネント | `pnpm test:unit` | ~2 秒 | 不要 |
| API テスト（モック） | `pnpm test:api` | ~1 秒 | 不要 |
| 統合テスト（実 DB） | `pnpm test:integration` | ~3 秒 | **必要** |
| E2E（Playwright） | `pnpm test:e2e` | 数十秒 | **必要**（FE+BE 起動） |

### 1. ユニット・コンポーネントテスト（DB 不要）

```bash
# 全パッケージ一括実行
pnpm test:unit

# パッケージ個別実行
pnpm --filter @budget/common run test:unit   # Zod スキーマ UT
pnpm --filter @budget/api run test:unit      # コントローラ UT
pnpm --filter web run test:unit              # React コンポーネント UT
```

### 2. API テスト（モック・DB 不要）

```bash
pnpm test:api
```

### 3. 統合テスト（実 DB を使用）

統合テストはテスト専用の隔離された MySQL インスタンス（port **3307**）を使用します。

**手順 1: テスト用 DB を起動する**

```bash
docker compose -f docker-compose.test.yml up -d
```

> `docker-compose.test.yml` は tmpfs（揮発ストレージ）を使用するため、コンテナ停止時にデータは消去されます。開発用 DB（port 3306）とは完全に独立しています。

**手順 2: DB の起動完了を確認する**

```bash
docker compose -f docker-compose.test.yml ps
# STATUS が "(healthy)" になるまで待つ（約 10 秒）
```

**手順 3: 統合テストを実行する**

```bash
pnpm test:integration
```

**手順 4: テスト後に DB を停止する（任意）**

```bash
docker compose -f docker-compose.test.yml down
```

#### 冪等性の仕組み

統合テストは以下の仕組みで各テストケースの独立性を保証しています。

| 仕組み | 説明 |
|---|---|
| `resetDatabase()` | `beforeEach` で全テーブルを TRUNCATE し、真っさらな状態から開始 |
| `seedTestData({ pattern })` | シナリオに応じたテストデータを `ulid()` で動的 ID を生成して投入 |
| `fileParallelism: false` | テストファイル間の DB 状態競合を防ぐため並列実行を無効化 |

#### シードパターン一覧

| パターン | 再現シナリオ |
|---|---|
| `minimal` | ログイン確認用の最小構成（ユーザー 1 件のみ） |
| `lastMonthHeavyUser` | 前月に大量の経費を申請し、今月初めてログインしたユーザー（支出 15 件 + 収入 1 件） |
| `managerUser` | 複数プロジェクトを跨いで経費を管理する管理職ユーザー（今月・先月・複数カテゴリ） |
| `edgeCases` | 最小金額（1 円）・未来日付・250 文字の備考欄・content null を含む実運用イレギュラーデータ |

### 4. verify-flow.sh（コミット前全検証）

```bash
bash .claude/hooks/verify-flow.sh
```

実行順序: **type-check → test:unit → test:api → test:integration（DB 起動時のみ）→ build**

- テスト DB（port 3307）が未起動の場合、統合テストは自動スキップされます
- いずれかのステップが失敗すると即座に中断し、コミットをブロックします

### 5. E2E テスト（Playwright）

```bash
# FE（port 3000）と BE（port 3001）を先に起動してから実行
pnpm test:e2e
```

> E2E テストの詳細は `e2e/` ディレクトリを参照してください。

---

## よく使うコマンド

- 全体ビルド: `pnpm turbo run build`
- 全体 lint: `pnpm turbo run lint`

## DB スキーマ共有（DBML / dbdocs.io）

### DBML の生成

TypeORM の Entity から DBML を生成します。

```bash
pnpm db:docs
```

生成物:

- `docs/database/schema.dbml`

### dbdocs.io へアップロード（共有 URL 発行）

事前に `dbdocs` でログイン（またはトークン）を準備してください。

```bash
pnpm --filter @budget/api exec -- dbdocs login
```

共有（`--public` で URL 共有）:

```bash
pnpm db:share
```

補足:

- デフォルトでは `apps/api` の `db:share` は `--public` でアップロードします。
- `dbdocs build` は `--project` を指定することで、プロジェクト名（例: `yourname/budget-management-tool`）に紐づけられます。
- 初回は `dbdocs login`（または `dbdocs token`）が必要です。
