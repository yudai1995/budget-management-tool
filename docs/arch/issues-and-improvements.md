# 課題・改善点分析
## budget-management-tool — ビジネス × エンジニアリング両軸レビュー

**作成日**: 2026-04-13
**調査対象**: `apps/web`, `apps/api`, `packages/`, `docs/`

---

## ビジネス面

---

### B-1: PRDのコアバリューと現実装の乖離が大きい

**現状**

PRDには「ストッパー・アラート」「マジック・エントリ」「パーソナライズ・インサイト」という3つのコアバリューが定義されているが、現在の実装はそのどれも未着手。現状は「記録できる」だけで、PRDが解決しようとしていた P2（実効性の欠如：記録だけで満足し使い過ぎに気づかない）を解消できていない。

**課題**

- ユーザーが今月いくら使ったかは見えるが、「予算に対してあと何円か」が分からない
- M2（ストッパー MVP）の前提となる `BudgetLimit` エンティティが存在しない
- M2 の実装に入れる状態ではない（カテゴリDB未定義、予算設定UI未着手）

**改善方針**

M1（マルチテナント強化）→ M2（予算設定 + ストッパー）を連続して進めるためのデータモデル整理を先行させる。

---

### B-2: カテゴリがDBに存在しないため予算管理が実質不可能

**現状**

`categoryId` は整数値で `budget_list` に保存されるが、カテゴリの定義（名称・種別）はフロントエンドのクライアント側静的配列のみに存在する。DBにカテゴリテーブルがない。

**課題**

- カテゴリ別予算の設定（M2コア）が実装できない
- ユーザーごとのカスタムカテゴリが作れない
- カテゴリ名の変更・廃止が全履歴に波及する

**改善方針**

```sql
-- 追加が必要なテーブル
category     : id, name, type(expense|income), userId(null=共通), color
budget_limit : id, userId, categoryId, amount, period(weekly|monthly), startDate
```

---

### B-3: ユーザー登録フローが不明確（ゲストのみ？）

**現状**

APIに `/api/login`・`/api/guest-login` は存在するが、新規ユーザー登録（サインアップ）のエンドポイントが確認できない。`IUserRepository.save()` は存在するが、フロントエンドから叩く入口がない。

**課題**

- 個人ツールであれば現状（ゲスト固定ユーザー）でも動作するが、PRDには「マルチテナント」「ユーザー単位でのデータ分離」がM1目標として明記されている
- 誰が使うツールなのか（自分専用か、複数人か）がドキュメントに記載されていない

**改善方針**

ターゲットを明確化する。

| ターゲット | 対応方針 |
|----------|---------|
| 自分専用ツール | 認証はシンプルなままでよく、ゲストモードを廃止して固定ユーザーにする |
| 複数人対応 | `/api/register` の追加とオンボーディングUIが必要 |

---

### B-4: KPIを計測する仕組みが存在しない

**現状**

PRDに6つのKPI（WAU/登録率、入力完了時間、自動提案採用率など）が定義されているが、それらを計測するための計装（ログ・分析イベント）が一切存在しない。

**課題**

- 「継続率が上がったか」「入力時間が短縮されたか」を客観的に判断できない
- 機能改善の優先度を決める根拠がない

**改善方針**

最小限の計装として、以下のイベントをサーバーサイドログ（CloudWatch Logs）に記録する:

```typescript
expense_created  { userId, categoryId, inputTimeSec, source }
login_success    { userId, method: 'guest' | 'normal' }
session_duration { userId, durationSec }
```

本格的なアナリティクスが必要になったら PostHog（OSS）や Mixpanel を追加する。

---

## フロントエンド面

---

### F-1: 支出入力フォームが予算管理ツールとして機能を果たしていない

**現状**

入力できるフィールドは `amount`, `balanceType(0|1)`, `categoryId`, `date`, `content` のみ。金額を記録するだけで、「今月あとどれだけ使えるか」は表示されない。

**課題**

- ホーム画面に残予算・使用率の表示がない
- 支出登録後にフィードバックがない（「今月食費を80%使いました」等）
- PRD P2の「使い過ぎに気づかない」問題をUIが解決できていない

**改善方針**

```
ホーム画面の情報設計（優先順）:
  [今月の残予算: ¥23,400 / ¥50,000]  ← 最優先で追加
  [カテゴリ別: 食費 60% / 交通費 20% / ...]
  [入力フォーム]
  [直近の記録]
```

---

### F-2: `balanceType: 0 | 1` というマジックナンバーがUIに漏れている

**現状**

`packages/common/src/types/expense.ts` の `BalanceType = 0 | 1` がフォームコンポーネントまで直接伝播している。`0 = 支出, 1 = 収入` という意味がコードを読まないと分からない。

**課題**

- フォームの select 値として `0`/`1` を直接扱っている箇所がある
- 新規開発者・AIがコードを読む際に誤解しやすい

**改善方針**

```typescript
// packages/common に追加
export const BALANCE_TYPE = {
    EXPENSE: 0,
    INCOME: 1,
} as const;
export type BalanceType = typeof BALANCE_TYPE[keyof typeof BALANCE_TYPE];

// 表示ラベルのマッピングも共通化
export const BALANCE_TYPE_LABEL: Record<BalanceType, string> = {
    [BALANCE_TYPE.EXPENSE]: '支出',
    [BALANCE_TYPE.INCOME]: '収入',
};
```

---

### F-3: 支出の編集・削除が部分実装のまま

**現状**

APIには `PUT /api/expense/{id}`・`DELETE /api/expense/{id}` が実装されているが、フロントエンドの `ExpenseList` コンポーネントで編集UIが完成していない。

**課題**

- 誤入力を修正できない
- データ品質が低下し、インサイト（M3）の信頼性が損なわれる

**改善方針**

インライン編集（行クリックで編集モード）またはモーダル編集UIを優先して完成させる。

---

### F-4: カレンダービューが未完成

**現状**

`/calendar` ページと `MonthlyCalendar.tsx` が存在するが実装途中。

**課題**

PRDのマイルストーンには明示的に記載されていないが、「いつ何に使ったか」の時系列把握は日常使いに直結する機能。

**改善方針**

優先度を明確化する。M1完了後に判断でよい。現状ではナビゲーションの `/calendar` リンクを非表示にし、未完成ページへの動線を断つ。

---

### F-5: モバイル対応の状況が未検証

**現状**

Tailwind CSS v4 を使用しているが、レスポンシブ設計の実装状況（`md:` / `sm:` breakpoint の使用状況）が未確認。

**課題**

家計簿は外出先でスマートフォンから記録する用途が多い。モバイル体験が悪いと継続率（K1）に直接影響する。

**改善方針**

モバイルファーストで設計し直す。入力フォームのボタンサイズ・タップターゲット（最低44px）・数値入力キーボード（`inputmode="numeric"`）を優先確認する。

---

## バックエンド面

---

### E-1: 認可（Authorization）が不完全 — ユーザー間データ混在リスク

**現状**

`GET /api/expense` が認証済みトークンを受け取るが、取得クエリが「全件取得」になっている可能性がある。`PrismaExpenseRepository.findAll()` に `userId` フィルタが入っているか要確認。

**課題**

ユーザーAがユーザーBの支出データを取得できる状態であれば、個人情報漏洩に相当する重大な欠陥となる。

**改善方針**

全リポジトリメソッドに `userId` を必須引数として強制する:

```typescript
// IExpenseRepository の修正案
interface IExpenseRepository {
    findAll(userId: string): Promise<Expense[]>;
    findById(id: string, userId: string): Promise<Expense | null>;
    save(expense: Expense): Promise<void>;
    remove(id: string, userId: string): Promise<void>;
}
```

ユースケース・プレゼンテーション層でトークンから `userId` を取り出し、必ず渡すことを強制する。

---

### E-2: ユースケース層が薄く、ビジネスロジックがプレゼンテーション層に漏れている

**現状**

`CreateExpenseUseCase` のみが実装されており、他のCRUD（更新・削除・取得）はルートハンドラで直接リポジトリを呼んでいると推測される。

**課題**

- 所有者チェック・論理削除管理・バリデーションがどこにあるか不明確
- テストがプレゼンテーション層依存になり、ドメインロジックの単体テストが書けない

**改善方針**

最低限以下のユースケースを追加する:

```
UpdateExpenseUseCase   — 所有者確認 + 更新
DeleteExpenseUseCase   — 所有者確認 + 論理削除
GetExpensesUseCase     — userId フィルタ + ページネーション
GetExpenseByIdUseCase  — 所有者確認 + 取得
```

---

### E-3: エラーレスポンスの形式が不統一

**現状**

Zod バリデーションエラー・認証エラー・DBエラーそれぞれのエラーレスポンス形式が統一されているか不明。`@hono/zod-openapi` のデフォルト挙動に依存している部分がある。

**課題**

- フロントエンドのエラーハンドリングが「エラー形式によって分岐」するコードになる
- API クライアントで型安全なエラー処理ができない

**改善方針**

エラーレスポンスを OpenAPI スキーマに定義し、全ルートの `responses` に登録する:

```typescript
const ErrorSchema = z.object({
    code: z.string(),    // "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR"
    message: z.string(),
    details: z.unknown().optional(),
});

// createRoute に必ず含める
responses: {
    400: { content: { 'application/json': { schema: ErrorSchema } } },
    401: { content: { 'application/json': { schema: ErrorSchema } } },
    404: { content: { 'application/json': { schema: ErrorSchema } } },
}
```

---

### E-4: ページネーション・検索フィルタが未実装

**現状**

`GET /api/expense` は全件取得。使い続けるとレスポンスサイズが無制限に増える。

**課題**

- 1年分の支出（365件以上）を毎回全件返す
- カレンダー表示・月次フィルタリングをクライアント側で行うと、不要なデータ転送が発生する

**改善方針**

```
GET /api/expense?year=2026&month=04&page=1&limit=50
```

月・年単位のフィルタを最優先で追加する（インサイト機能の前提条件）。

---

### E-5: 構造化ログが存在しない

**現状**

`console.log` ベースのログのみ（あるいは省略）。本番運用時に CloudWatch Logs でクエリをかけるのが困難。

**改善方針**

```typescript
// 最小限の構造化ログ（pino or console.log with JSON）
logger.info({
    event: 'expense_created',
    userId,
    expenseId,
    amount,
    durationMs,
});
```

---

## データモデル面

---

### D-1: `budget_list` テーブル名が「取引」と「予算」を混同させる

**現状**

テーブル名は `budget_list` だが、実際には「支出・収入の取引記録」を格納している。`CLAUDE.md` にも「`budget_list` テーブルは `Expense` の永続化先として扱う」と注記されているほど混乱している。

**課題**

- 新規参加者（人間・AI）がコードを読むたびにコンテキストの読み直しが必要
- M2で「予算設定」テーブルを追加する際に命名がさらに混乱する

**改善方針**

Prisma の `@@map` を活用してドメイン名と物理テーブル名を切り離す。現在は `BudgetList` モデルを `Transaction` または `ExpenseRecord` にリネームし、`@@map("budget_list")` で物理名を維持することで移行コストをゼロにする。

```prisma
model Transaction {       // ← リネーム
  // ...
  @@map("budget_list")    // ← 物理テーブル名は維持
}
```

---

### D-2: ソフトデリート（`deletedDate`）の運用ポリシーが未定義

**現状**

`budget_list` に `deletedDate DateTime?` が存在し、論理削除が実装されている。しかし「削除済みを除外するフィルタ」がリポジトリ全メソッドに適用されているか不明。

**課題**

- 削除済みデータが集計・インサイトに混入する可能性
- 「何日後に物理削除するか」のポリシーが未定義

**改善方針**

Prisma の `$extends` で削除済みを自動除外するクライアント拡張を定義するか、全クエリに `where: { deletedDate: null }` を明示する規約を定める。

---

## 開発体験（DX）・運用面

---

### X-1: `pnpm dev` の起動が重く、初回体験が悪い

**現状**

`dev.sh` が Docker起動 → ヘルスチェック待機 → Prismaマイグレーション → Seed → codegen → turbo dev という7ステップを毎回実行する。

**課題**

- 既にDBが起動済みの場合でも毎回ヘルスチェック待機が走る
- `codegen` が毎回実行されるため、起動まで20〜30秒かかる

**改善方針**

```bash
pnpm dev        # 初回・DB再起動時（現行の full フロー）
pnpm dev:fast   # 2回目以降（codegen + turbo dev のみ）
```

---

### X-2: `sandbox` アプリの役割が不明確

**現状**

`apps/sandbox/` が存在するがドキュメントに記載がなく、誰がいつ何のために使うものか不明。

**改善方針**

「コンポーネント・スタイリングの検証用」など用途を定義する。不要であれば削除し、`turbo.json` のビルド対象からも除外する。

---

## 優先度マトリクス

| 優先度 | ID | 課題 | 理由 |
|--------|-----|------|------|
| 🔴 即対応 | E-1 | 認可不完全（データ混在リスク） | セキュリティ・プライバシー |
| 🔴 即対応 | D-2 | ソフトデリートの漏れ | データ整合性 |
| 🟠 M1着手前 | B-2 | カテゴリDBの追加 | M2の前提条件 |
| 🟠 M1着手前 | D-1 | テーブル名の整理 | 混乱の根本原因 |
| 🟡 M1と並行 | E-2 | ユースケース層の整備 | テスト可能性・拡張性 |
| 🟡 M1と並行 | F-3 | 支出編集UIの完成 | 基本機能の穴埋め |
| 🟡 M2着手前 | F-1 | 残予算表示UIの設計 | M2の主要アウトプット |
| 🟡 M2着手前 | E-4 | ページネーション追加 | データ増加への対応 |
| 🟢 本番前 | B-4 | KPI計測の計装 | 改善ループの確立 |
| 🟢 本番前 | E-3 | エラーレスポンス統一 | フロントエンド安定性 |
| 🟢 本番前 | E-5 | 構造化ログ | 運用可観測性 |
| ⚪ 随時 | F-2 | マジックナンバー廃止 | コード品質 |
| ⚪ 随時 | F-5 | モバイル対応確認 | 継続率への影響 |
| ⚪ 随時 | B-3 | ユーザー登録方針の確定 | スコープ定義 |
| ⚪ 随時 | X-1 | dev起動の高速化 | 開発体験 |
| ⚪ 随時 | F-4 | カレンダーUI完成 or 非表示化 | UX整合性 |

---

*本ドキュメントは `apps/api`, `apps/web`, `packages/`, `docs/PRD/`, `docs/design/` の実装を直接参照して作成。*
