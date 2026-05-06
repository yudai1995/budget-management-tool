# Sandbox — AI エージェント向け利用ガイド

**使い方の詳細は [`apps/sandbox/README.md`](./README.md) を必ず読むこと。**

---

## Sandbox とは

`apps/web` に実装する前に UI/UX コンポーネントを試作・検証する環境。
本番コードに触れず、デザイントークンを共有した状態でレイアウト・インタラクションを確認できる。

## AI エージェントへの必須ルール

### UI/UX 変更は Sandbox-First で進めること

`apps/web/src/components/` または `apps/web/src/app/` に **新規コンポーネント・画面デザインの変更** を加える場合は、以下の順序で作業すること。

```
1. apps/sandbox/src/pages/ にプロトタイプを作成
2. pnpm --filter sandbox dev でブラウザ確認
3. ユーザーのレビュー・承認を得る
4. apps/web に本番実装を移植する
```

ただし、以下は Sandbox を経由しなくてよい：
- バグ修正（見た目の変更を伴わないもの）
- テキスト・ラベル・エラーメッセージのみの変更
- Server Actions・API ロジックの修正

### 新しいプロトタイプを追加する手順

1. `apps/sandbox/src/pages/` にコンポーネントファイルを作成
2. `apps/sandbox/src/main.tsx` に Route を追加
3. `apps/sandbox/src/pages/Gallery.tsx` の `prototypes` 配列にエントリを追加

詳細（デザイントークン一覧・ディレクトリ構造・起動方法）は [`README.md`](./README.md) を参照。
