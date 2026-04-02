---
name: engineer-conventional-commits
description: Splits work-in-progress into atomic commits that follow this repository’s `.cursorrules` Conventional Commit rules, and uses Serena MCP (`get_symbols_overview`, `find_symbol`, `find_referencing_symbols`, `search_for_pattern`, `find_file`) to verify impact before writing accurate subjects and bodies. Use when @Engineer is asked to commit, to align with the project Git protocol, or when the user requests meaningful commit splits with Serena-backed messages.
---

# Engineer: コミット規約準拠の分割コミット（Serena 連携）

## いつ使うか

- ユーザーが **@Engineer** に対し、**制定したコミット規約**に従ってコミットすることを依頼したとき
- **意味のある単位への分割**、**Serena で影響範囲を確認してから正確なメッセージ**などが指示に含まれるとき

## 規約の正（single source of truth）

次を**必ず優先**する（本文にルールを丸写ししない。必要なら該当節を開いて照合する）。

- リポジトリルートの **`.cursorrules`** 内「Git とバージョン管理プロトコル」「コミットメッセージのプレフィックスとフォーマット」「Serena MCP との連携（コミット作成時）」

## 実行前の前提確認

- **`main` 上に直接コミットしない**。作業ブランチは `ai/<トピック-kebab-case>` など既存方針に合わせる。
- 作業ツリーに**無関係な変更が混在**している場合は、`git stash` や先行コミットで区切るよう提案し、単に混ぜてコミットしない（`.cursorrules` のチェックポイントに従う）。

## 手順

### 1. 変更内容の把握

- `git status` で対象ファイルと未追跡の有無を確認する。
- `git diff`（必要なら `git diff --stat`）で、**論理的なまとまり（単一の意図）**ごとにグルーピングする。

### 2. 論理単位への分割（Atomic Commits）

- **1 コミット = 1 つの意図・1 つのレビュー単位**。無関係な修正を同一コミットに入れない。
- 分割基準の例: 機能追加とドキュメントのみの更新、バグ修正とリファクタ、設定変更と挙動変更、などは分ける。

### 3. Serena で影響範囲を確認（コミット案ごと）

コミットに含める変更に対し、**推測でメッセージを書かない**。少なくとも次を状況に応じて使う。

| 目的 | ツール（Serena MCP） |
|------|----------------------|
| ファイル内のシンボル一覧・入口の把握 | `get_symbols_overview` |
| 特定クラス / 関数 / メソッドの定義と本体 | `find_symbol`（必要なら `include_body`） |
| 変更シンボルの参照元・呼び出し側 | `find_referencing_symbols` |
| 名称が不確かなときの探索 | `search_for_pattern` |
| パス特定 | `find_file` |

**`fix` / `refactor` では**、メッセージ Body に **クラス名・関数名・モジュールパス**など、Serena で裏取りした**具体名を明記**する（`.cursorrules` 必須事項）。

### 4. メッセージ作成（プロジェクト規約どおり）

- **許可プレフィックスは 7 のみ**: `feat` \| `fix` \| `docs` \| `style` \| `refactor` \| `test` \| `chore`（独自ラベル禁止）。
- **1 行目（Subject）**: `<prefix>: <description>` または `prefix(scope): description`（[Conventional Commits](https://www.conventionalcommits.org/) の精神に従う）。
- **日本語の description** は、規約どおり **体言止め**／**完了した変更内容が分かる**表現にする。情報ゼロな単語のみ（例:「対応」だけ）は禁止。
- **複雑な変更**（複数ファイル・複数関心・リスクあり）は、1 行目の後に**空行**を挟み **Body** を書く。Body では次を**箇条書き**で書く: 変更の内訳、理由・背景、既知リスクやフォロー予定。

### 5. ステージとコミット

- **`git add` はそのコミットに入れるファイルだけ**に限定する（部分ステージ `git add -p` も可）。
- コミット実行: `git commit`（エディタで Subject + Body）または、Body が短い場合はチーム運用に合わせた方法でよい。

### 6. 残りの論理塊に繰り返す

- すべての意図した変更がコミットされるまで 3〜5 を繰り返す。

## コミット直前チェックリスト

- [ ] プレフィックスは **7 種のみ**か
- [ ] Subject が**抽象的すぎず**、対象と内容が特定できるか
- [ ] `fix` / `refactor` に、Serena で確認した**主要シンボル・パス**が Body 等に含まれているか
- [ ] 無関係な変更がステージに混ざっていないか

## 短い例（Subject のみ可な場合のイメージ）

規約の例に倣い、具体性を保つ。

- `fix: 週次集計で日付境界を翌週にまたがないよう修正`
- `docs: PRD に KPI の計測窓を追記`
- `feat(api): 取引一覧レスポンスに userId を含める`
