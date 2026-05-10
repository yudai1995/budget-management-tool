# コーディング規約

**このファイルは `.github/` SSOT の一部である。すべての AI エージェントはこのファイルを参照すること。**

---

## 共通（TypeScript）

### 型定義

- `any` の使用は原則禁止。やむを得ない場合は理由をコメントし `unknown` を検討する
- 型推論を優先するが、関数の引数と戻り値には必ず型注釈を付与する

### 非同期処理

- `async/await` を使用し、`Promise.then()` は避ける
- `try-catch` によるエラーハンドリングを適切に行い、握りつぶさない

### マジックナンバーの排除

- 意味のある数値や文字列は定数（`const`）または `as const` オブジェクトとして定義する

---

## バックエンド（DDD / Onion Architecture）

| 層 | パス | ルール |
|----|------|--------|
| Domain | `apps/api/src/domain/` | 外部ライブラリへの依存禁止。値オブジェクト（Value Object）を活用する |
| Application | `apps/api/src/application/` | 1つのユースケースは1つの責務のみを持つ |
| Infrastructure | `apps/api/src/infrastructure/` | 外部接続（DB, API）の詳細はここに閉じ込める |
| Presentation | `apps/api/src/presentation/` | リクエストバリデーションを行い、不正なデータはユースケースに渡さない |

---

## フロントエンド（Next.js App Router）

### Component 設計

- 1つのコンポーネントは 150行以内を目安にする
- 副作用（`useEffect`）の利用は最小限にし、イベントハンドラや `useMemo` で処理する

### UI/UX

- ローディング状態とエラー状態の表示を必ず考慮する
- 破壊的な操作の前には必ず確認（モーダル等）を挟む

---

## アイコン規約

- **アイコンライブラリの使用を必須とする**: UI にアイコンが必要な場合は必ず `lucide-react` を使用すること
- インラインの `<svg>` 直書きや絵文字での代替は禁止
- インポート例: `import { X, ChevronRight, TrendingDown } from "lucide-react";`
- サイズ指定: `size` prop または Tailwind の `w-*`/`h-*` クラスで統一する
- `strokeWidth` はデフォルト（2）を基本とし、デザイン上の理由がある場合のみ変更する

---

## Git 操作

- **コミットの粒度**: Atomic Commit（1変更＝1コミット）を徹底する
- **コミットメッセージ**: `.github/commit-message-instructions.md` に従うこと（SSOT）
- **PR の生成**: `.github/pull-request-instructions.md` に従うこと（SSOT）
- **ブランチ運用**: `{type}/{description}` 形式

---

## 開発・修正時の禁止事項

| 禁止事項 | 理由 |
|----------|------|
| 「ついで」の修正 | 指示外の箇所をリファクタリングしてはならない |
| 確認なしのコード削除 | コード削除時は影響範囲を報告し、許可を得ること |
| コメントの勝手な削除 | 既存の JSDoc や注釈を勝手に削除しない |
| 絵文字の使用 | コード・UI・コミットメッセージ・ドキュメントのいかなる箇所にも絵文字（emoji）を使用してはならない |
