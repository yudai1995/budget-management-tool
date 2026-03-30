---
name: engineer-pull-request
description: Creates a complete Pull Request (title/body) matching `.github/PULL_REQUEST_TEMPLATE.md`, performs Serena-backed impact analysis, and (when needed) creates Conventional Commit-aligned commits via `engineer-conventional-commits`, pushes the branch, then creates the PR using `gh pr create`. Use when @Engineer is asked to open a PR covering existing changes and to fill all template sections, especially Serena Insight.
---

# Engineer: PR 作成（テンプレート全項目＋ Serena Insight 詳細）

## いつ使うか

- **@Engineer** に対し、**ここまでの変更で PR を作成**することを依頼されたとき
- **`.github/PULL_REQUEST_TEMPLATE.md` の項目をすべて埋める**、特に **Serena Insight に影響範囲を詳しく**書くことが明示されたとき

## 正の参照

- **PR 本文の構造**: `.github/PULL_REQUEST_TEMPLATE.md`
- **運用ルール**: `.cursorrules` の「PR プロトコル（Pull Request）」および「Git とバージョン管理プロトコル」（タイトル・コミットとの整合）

## 一連の実行（コミット→プッシュ→ gh PR 作成）

このスキルでは、可能な限り以下を最後まで実行する。

1. **必要ならコミット分割**（`engineer-conventional-commits` を参照）
2. **ブランチをプッシュ**
3. **`gh pr create` で PR 作成**

※ もし `git push` / `gh` の実行に必要な情報（未設定リモート名や `gh` 認証など）が不足している場合は、コマンドに必要な前提を最小限で質問し、作業を止める。

## PR 作成前（必須：事前確認）

1. **変更がコミット済みか**確認する。未コミットのみの場合は、コミット規約に従った分割コミットを先に完了するか、ユーザーに確認する（`.cursorrules` のチェックポイント）。
2. **セルフレビュー**: `find_referencing_symbols` / `search_for_pattern` / `get_symbols_overview` 等で見落としと影響を拾い、**PR 前に修正できる不備は修正**する（`.cursorrules` の「AI セルフレビュー」）。
3. **ブランチが PR 用に用意されているか**確認する（無ければ作業ブランチを `ai/<機能・トピックの kebab-case>` で作成）。

## 実行手順（ローカル→リモート→ PR）

ここから先は、可能な限りコマンドで実行して完結させる。

1. **（必要なら）コミット分割**
   - `git status --porcelain` で未コミット/未ステージがあれば、`engineer-conventional-commits` に従って **意味のある単位に分割し commit** する。
   - すでに意図したコミットが揃っている場合は、この手順をスキップする。

2. **ブランチ/リモートの準備**
   - 現在のブランチが PR 用でない場合、`ai/<機能・トピックの kebab-case>` を切り直す（既存があれば流用してよい）。
   - `git remote -v` で `origin` があることを確認する。なければ `git push` のためにリモート名と URL をユーザーに確認する。
   - `main` がベースになる前提で進める（`main` 以外のベースが必要なら事前に確認）。

3. **プッシュ**
   - `git push -u origin <branch>` を実行する。
   - 失敗した場合（権限・認証・保護ブランチ等）は、エラー要約と対処方針を提示して作業を止める。

4. **PR 本文（テンプレート全項目）を作成**
   - `.github/PULL_REQUEST_TEMPLATE.md` の **Description / Traceability / Serena Insight / Verification** を **空欄なし**で作る。
   - 特に **Serena Insight** は、変更・触れたシンボル、`find_referencing_symbols` 等の裏付け、影響範囲の抜粋、見落とし予防まで書く。

5. **`gh` で PR 作成**
   - `gh` が使える状態か確認する（必要なら `gh auth status` を案内）。
   - 例（タイトルと本文は上で生成した値を差し込む）:
     ```sh
     gh pr create --title "$TITLE" --body "$BODY" --base main --head "$BRANCH"
     ```
   - `gh pr create` 実行後に返る **PR URL または PR number** を提示する。

## 出力の形

まず次を生成し、その後に `gh pr create` で PR を作成する。

1. **PR タイトル**（1 行）  
   - テンプレート冒頭コメントに従い、**Conventional Commits に近い形式**（例: `feat|fix|refactor: {簡潔な内容}`）。  
   - マージされるコミット群と矛盾しない内容にする。

2. **PR 本文**  
   - `PULL_REQUEST_TEMPLATE.md` の **見出し・コメントは残してよい**が、**プレースホルダー（空の箇条書き）はすべて実値で埋める**。  
   - テンプレートに無い追記が必要でも、**セクションを省かない**。

3. **PR 作成結果**
   - `gh pr create` 実行後に返る **PR URL** または **PR number** を提示する。

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

- ブランチ名、`git push -u origin <branch>`、`gh pr create` の使用コマンド（実行したもの）を **1ブロック**で足してよい。

## チェックリスト（出力直前）

- [ ] テンプレートの **Description / Traceability / Serena Insight / Verification** がすべて埋まっている
- [ ] **Serena Insight** にシンボル・参照の抜粋・使用ツール・リスクのいずれかが欠けていない
- [ ] PR タイトルが **Conventional Commits 風**で具体的内容か
- [ ] `.serena/memories/` の該当があれば **メモリ名**を本文に含めたか
