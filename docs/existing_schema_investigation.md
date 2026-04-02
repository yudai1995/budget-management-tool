# 既存ソースからの DB スキーマ痕跡調査（暫定まとめ）

調査日: 2026-04-02 時点のリポジトリ  
**着眼点**: 新規 DB 設計の前に、「コード上に残っている」テーブル・カラム・ORM 設定のみを列挙する。  
**注意**: 本リポジトリには **手書きのマイグレーション SQL や Knex/Sequelize/Prisma のスキーマ定義は存在しない**。実体は **TypeORM の Entity（`synchronize: true`）** に依存している。

---

## 1. 静的解析で特定した根拠

### 1.1 Entity / Model（一次情報）

| ファイル | 役割 |
|---------|------|
| `apps/api/src/entity/Budget.ts` | テーブル名 `budget_list`、カラム定義の一次ソース |
| `apps/api/src/entity/User.ts` | テーブル名 `user_list`、カラム定義の一次ソース |
| `apps/api/src/model/errorModel.ts` | **DB スキーマではない**（API エラー識別子の列挙のみ） |

### 1.2 TypeORM データソース

`apps/api/src/data-source.ts` より:

- DB 種別: **MySQL**
- DB 名: 環境変数 `DB_NAME`（未設定時 `budgetdb`）
- **マイグレーション未使用**: `migrations: []`
- **スキーマ自動同期**: `synchronize: true`  
  → 実 DB の列は起動時に Entity から生成・更新される運用（本番では非推奨だが、現状の意図として記録）

### 1.3 Controller 内の生 SQL

- `apps/api/src/controller/BudgetController.ts` の `remove` のみ **QueryBuilder** で `DELETE FROM budget_list` 相当の削除を実行（テーブル名は Entity の `name: 'budget_list'` に依存）。
- `SELECT` / `INSERT` / `CREATE TABLE` の **文字列リテラル SQL はリポジトリ内に未検出**（`*.ts` / `*.tsx` / `*.sql` で grep）。

### 1.4 マイグレーション・ORM の有無（リポジトリ探索）

| 項目 | 結果 |
|------|------|
| `**/migration*/**` | **なし** |
| `.sql` ファイル | `mysql/init/001_init.sql` のみ（**プレースホルダコメントのみ**。スキーマ定義なし） |
| `knex` / `sequelize` / `prisma` | **未使用**（依存・コード参照なし） |
| `typeorm` | **使用**（`apps/api` のみ） |

### 1.5 フロント側の「データ形状」（DB ではないが整合確認用）

- `client/src/Model/budget.model.tsx`  
  - クラス `Budget`: `id`, `amount`, `categoryId`, `date`, `balanceType`, `content`（class-validator で検証）
  - サーバ Entity の `balanceType` は `0 | 1` で、フロントの `BalanceType` 列挙（支出/収入）と対応
- `client/src/Model/Category.model.tsx`  
  - **カテゴリはフロントの静的データ**として扱われており、`user_list` / `budget_list` に **Category テーブルは Entity として存在しない**

### 1.6 インフラ・初期化

| ファイル | 内容 |
|---------|------|
| `docker-compose.yml` | `db` サービス（MySQL 8.0）、`./mysql/init` → `/docker-entrypoint-initdb.d` マウント |
| `mysql/init/001_init.sql` | スキーマ定義 **なし**（コメントのみ） |
| `mysql/my.cnf` | キャラセット等（テーブル定義ではない） |
| `.env.example` | `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOSTNAME`, `DB_PORT` など接続ヒント |
| `Dockerfile` | リポジトリ内 **未検出** |

### 1.7 ビルド成果物

- `apps/api/build/**` は `tsc` 出力。**スキーマの一次定義ではない**が、Entity 名・テーブル名はソースと一致。

---

## 2. 推定スキーマ構成（Entity ベース）

TypeORM のデフォルトでは、特に `name` を指定していなければ **プロパティ名が列名**になる（本 Entity は `@Column` に `name` 未指定のため、下表の「論理列名」はプロパティ名と一致する想定）。

### 2.1 テーブル一覧

| 論理テーブル名（Entity の `name`） | 対応 Entity |
|-----------------------------------|-------------|
| `budget_list` | `Budget` |
| `user_list` | `User` |

### 2.2 `user_list`

| 列名（推定） | 型（アプリ上の解釈） | 制約・備考 |
|-------------|---------------------|-----------|
| `userId` | string（DB では可変長文字列） | **PRIMARY KEY**（`@PrimaryColumn`） |
| `userName` | string | NOT NULL（`nullable` 未指定） |
| `password` | string | NOT NULL（ハッシュ保存想定・長さは未指定） |

### 2.3 `budget_list`

| 列名（推定） | 型（アプリ上の解釈） | 制約・備考 |
|-------------|---------------------|-----------|
| `id` | string | **PRIMARY KEY**（`@PrimaryColumn`） |
| `amount` | number（整数） | `int` |
| `balanceType` | `0` または `1` | MySQL では `enum (0,1)` 指定に相当（TypeORM の `enum: [0, 1]`） |
| `categoryId` | number | `int`、`default: 1` |
| `content` | string \| null | **NULL 可**（`nullable: true`） |
| `date` | string | NOT NULL。アプリ上は日付文字列（`YYYY-MM-DD` 形式で使われている） |
| `createdDate` | Date | `CreateDateColumn`、`update: false` |
| `updatedDate` | Date | `UpdateDateColumn` |
| `deletedDate` | Date \| null | `DeleteDateColumn` → **ソフトデリート**用（NULL なら有効行） |

### 2.4 リレーション（外部キー）

- Entity 間に `@ManyToOne` / `@OneToMany` / `@JoinColumn` **は定義されていない**。
- `budget_list` に **`userId` 列はない**。
- 認証は `express-session` の `req.session.login` にユーザー ID を格納しているが、**家計データとユーザーの紐付けは DB スキーマ上は行っていない**（全ユーザーが同一の `budget_list` を共有する形に近い挙動）。

---

## 3. 断片情報と新設計への示唆

- **カテゴリ**: DB テーブルなし。将来マスタ化するなら `category` テーブルと `budget_list.categoryId` の FK 整備が自然。
- **マルチユーザー**: 現状スキーマは「ログイン」と「家計行」の **DB レベル分離なし**。新設計では `budget_list.user_id`（またはテナント ID）追加がほぼ必須。
- **スキーマ管理**: `synchronize: true` 依存のため、過去の「確定 DDL」はリポジトリに残っていない。本ドキュメントは **ソースからの復元**に限る。

---

## 4. 暫定版 `init.sql` 案（推測を含む）

以下は **Entity と TypeORM の一般的な MySQL マッピングを仮定**した DDL 案である。実列型・長さはプロジェクトの TypeORM / MySQL 実行結果で確定させること。

```sql
-- 暫定: user_list
CREATE TABLE IF NOT EXISTS user_list (
  userId VARCHAR(255) NOT NULL PRIMARY KEY,
  userName VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 暫定: budget_list（ソフトデリート列あり）
CREATE TABLE IF NOT EXISTS budget_list (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  amount INT NOT NULL,
  balanceType ENUM('0','1') NOT NULL,
  categoryId INT NOT NULL DEFAULT 1,
  content VARCHAR(255) NULL,
  date VARCHAR(255) NOT NULL,
  createdDate DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedDate DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deletedDate DATETIME(6) NULL,
  INDEX idx_budget_list_date (date),
  INDEX idx_budget_list_deletedDate (deletedDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**注意**:

- `balanceType` の実際の DDL は、MySQL では **TINYINT** になる場合もある（TypeORM の `enum` 解釈依存）。
- `createdDate` / `updatedDate` の精度は TypeORM バージョン・設定により `DATETIME` / `timestamp` が変わり得る。
- `VARCHAR` の長さは Entity で未指定のため **255 は仮**。

---

## 5. 調査で参照した主なファイル一覧

- `apps/api/src/entity/Budget.ts`
- `apps/api/src/entity/User.ts`
- `apps/api/src/data-source.ts`
- `apps/api/src/controller/BudgetController.ts`
- `apps/api/src/controller/UserController.ts`
- `apps/api/src/model/errorModel.ts`
- `mysql/init/001_init.sql`
- `docker-compose.yml`
- `.env.example`
- `client/src/Model/budget.model.tsx`
- `client/src/Model/Category.model.tsx`

---

*Serena MCP は当該セッションでツールが利用できなかったため、上記はワークスペース内の検索・読取により実施した。*
