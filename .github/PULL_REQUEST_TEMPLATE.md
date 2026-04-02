<!--
PR を開いたら、まず GitHub の「タイトル」欄に入力してください（本文とは別欄）。
Conventional Commits に近い形式を推奨。

形式の例: feat|fix|refactor: {簡潔な内容}
例: feat: 取引保存時に userId を付与する
例: fix: 週次集計の日付境界のずれを修正
例: refactor: BudgetController のバリデーションを共通化
-->

## Description

<!-- 変更内容の要約（背景・目的・主な変更点・利用者・運用への影響） -->



## Traceability

<!-- この変更が紐づく一次情報。該当ファイルのパスを列挙（複数可）。 -->

- `docs/PRD/` または `docs/design/` の参照:
  - 
  - 

<!-- ドキュメント未更新で実装のみの場合は、その理由と @PM / @BA との合意の有無を記載 -->



## Serena Insight

<!-- Serena MCP で確認した「修正による影響範囲」。参照・変更したシンボル名（クラス / 関数 等）を列挙。 -->

- 影響を確認したシンボル（例）:
  - 
- 補足（検索に使ったツール: `find_referencing_symbols` / `find_symbol` 等）:



## Verification

<!-- @Tester または @Engineer による動作確認の結果 -->

- **確認担当**: @Tester / @Engineer（いずれかを明記）
- **実施内容**（コマンド、画面操作、期待結果）:


- **結果**: OK / NG（NG の場合は事象と再現手順）


<!-- 自動テストのみ・未実施の場合は理由とフォロー方法（Issue 番号等）を記載 -->
