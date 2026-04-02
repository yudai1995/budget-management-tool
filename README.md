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
