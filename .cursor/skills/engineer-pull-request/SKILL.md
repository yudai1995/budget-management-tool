---
name: engineer-pull-request
description: Produces a complete Pull Request body matching `.github/PULL_REQUEST_TEMPLATE.md`, fills every section including a detailed Serena Insight impact analysis, aligns the PR title with Conventional Commits, and incorporates PR protocol from `.cursorrules`. Use when @Engineer is asked to open or draft a PR, fill the team PR template, or emphasize Serena-backed impact scope for reviewers.
---

# Engineer: PR 作成（テンプレート全項目＋ Serena Insight 詳細）

## いつ使うか

- **@Engineer** に対し、**ここまでの変更で PR を作成**することを依頼されたとき
- **`.github/PULL_REQUEST_TEMPLATE.md` の項目をすべて埋める**、特に **Serena Insight に影響範囲を詳しく**書くことが明示されたとき

## 正の参照

- **PR 本文の構造**: `.github/PULL_REQUEST_TEMPLATE.md`
- **運用ルール**: `.cursorrules` の「PR プロトコル（Pull Request）」および「Git とバージョン管理プロトコル」（タイトル・コミットとの整合）

## PR 作成前（必須）

1. **変更がコミット済みか**確認する。未コミットのみの場合は、コミット規約に従った分割コミットを先に完了するか、ユーザーに確認する（`.cursorrules` のチェックポイント）。
2. **セルフレビュー**: `find_referencing_symbols` / `search_for_pattern` / `get_symbols_overview` 等で見落としと影響を拾い、**PR 前に修正できる不備は修正**する（`.cursorrules` の「AI セルフレビュー」）。
3. **リモートへプッシュ**可能な状態にする（`git push` の手順はユーザー環境に合わせて提示）。

## 出力の形

次を **ユーザーが GitHub にそのまま使える**形で出す。

1. **PR タイトル**（1 行）  
   - テンプレート冒頭コメントに従い、**Conventional Commits に近い形式**（例: `feat|fix|refactor: {簡潔な内容}`）。  
   - マージされるコミット群と矛盾しない内容にする。

2. **PR 本文**  
   - `PULL_REQUEST_TEMPLATE.md` の **見出し・コメントは残してよい**が、**プレースホルダー（空の箇条書き）はすべて実値で埋める**。  
   - テンプレートに無い追記が必要でも、**セクションを省かない**。

### セクション別の埋め方

#### Description

- **背景・目的**、**主な変更点**（箇条書きで具体）、**利用者・運用への影響**を書く。  
- **意思決定の理由**がメモリにある場合: Serena の `list_memories` / `read_memory` で **`.serena/memories/`** を参照し、**メモリ名と要約または引用**を本文に含める（`.cursorrules` の「コンテキストの保持」）。メモリに無い判断は **この PR 本文に要点だけ残す**。

#### Traceability

- **`docs/PRD/` または `docs/design/`** の対応ファイルパスを **列挙**（該当なしの場合はその旨と、実装のみの理由・**@PM / @BA との合意**の有無をテンプレートのコメント行の意図に沿って記載）。

#### Serena Insight（特に詳細に）

**短文の列挙だけにせず**、レビュアー（@Architect / @Reviewer）が技術的影響を追える粒度にする。

必ず含める候補:

- **変更・触れた主シンボル**（`name_path` やクラス / 関数 / モジュール名、ファイルパス）
- **参照関係**: 重要シンボルごとに `find_referencing_symbols` で分かった **呼び出し元・参照元**の要約（ファイル名やシンボル名レベルで列挙）
- **横断検索**: `search_for_pattern` で拾った **同パターン・類似呼び出し**があれば、レグレッション観点で1〜2行
- **ツールと作業**: 実際に使った Serena ツール名（例: `get_symbols_overview`, `find_symbol`, `find_referencing_symbols`, `search_for_pattern`, `find_file`）と、何を裏付けにしたかを1行で明記

表やサブ見出しを使ってよい。例:

```markdown
## Serena Insight

### 変更の中心となったシンボル
- `path/to/file.ext` — `ClassName.methodName`（変更内容の一言）

### 影響を受ける参照元（抜粋）
- `caller/A` → `ClassName.methodName`
- `caller/B` → ...

### 検索・確認で使った Serena ツール
- `find_referencing_symbols`（`TargetSymbol`）
- `search_for_pattern`（`".keywordOrApiName"`）

### リスク・見落とし予防
- （境界条件、API 互換、マイグレーション要否など、セルフレビューで分かったことを箇条書き）
```

未確認で推測のみの箇所は **「未確認」** と書き、**PR Description に開示**する（`.cursorrules` のセルフレビュー）。

#### Verification

- **確認担当**を `@Tester` または `@Engineer` のいずれかに**明記**する。  
- **実施内容**: 実行したコマンド、画面操作、期待結果を具体化。  
- **結果**: `OK` / `NG`。**自動テストのみ・未実施**なら、テンプレートのコメントどおり**理由とフォロー**（Issue 等）を書く。

## 提出後の案内（任意・短文）

- ブランチ名、`git push -u origin <branch>`、GitHub 上で PR を開く手順、または `gh pr create` の例を **1ブロック**で足してよい。

## チェックリスト（出力直前）

- [ ] テンプレートの **Description / Traceability / Serena Insight / Verification** がすべて埋まっている
- [ ] **Serena Insight** にシンボル・参照の抜粋・使用ツール・リスクのいずれかが欠けていない
- [ ] PR タイトルが **Conventional Commits 風**で具体的内容か
- [ ] `.serena/memories/` の該当があれば **メモリ名**を本文に含めたか
