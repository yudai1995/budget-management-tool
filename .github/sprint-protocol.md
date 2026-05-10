# 超・適応型開発プロトコル

**このファイルは開発体制ルールの SSOT（Single Source of Truth）である。**
Claude Code・Cursor・GitHub Copilot を問わず、開発に介入するすべての AI エージェントはこのファイルを作業開始時に読み込むこと。

---

## 1. 基本思想：ビジネスチャンスを逃さない開発

> 「今欲しいシステム」を思いついたとき、技術的・体制的な壁でチャンスを逃すことをゼロにする。

### 3つの原則

| 原則 | 意味 |
|------|------|
| **変更を前提とする** | 要件変更は例外ではなくデフォルト。スコープを調整してリリース日を守る |
| **1日 = 1スプリント** | 不定期な作業日それ自体をスプリントとして観測・記録する |
| **AIが迷わない透明性** | どのエージェントが介入しても「今ビジネスが何を求めるか」を即座に同期できる |

---

## 2. スプリントの定義（不定期1日スプリント）

### サイクル定義

```
[作業開始]
  └── GitHub Issue に in-progress ラベルを付与（タイムスタンプ自動記録）
        └── 実装 → テスト → コミット → PR 作成
              └── PR マージ
                    └── GH Actions: サイクルタイム自動計測 + Project フィールド（Cycle Time/Sprint #/Story Points）更新
                          └── スプリントレビュー（レトロスペクティブ記録）
                                └── 「Retro: Sprint #N」Issue を作成してスプリントボードに登録
                                      └── Try アクションを retro-action Issue 化 → 次スプリントバックログへ
[作業終了]
```

### スプリントの単位

- **1 PBI = 1 スプリント** — 作業日が不定期でも、PBI の完了をサイクルの区切りとする
- 1日で完了しない PBI は「翌作業日に持ち越し」ではなく **PBI を分割** して完了可能な粒度にする
- スプリント期間の上限は **5営業日相当**。超過しそうな場合はユーザーに分割提案する

---

## 3. ① チャンスを逃さない意思決定フロー

### 要件変更が発生したとき

```
要件変更の発生
    │
    ▼
MoSCoW でスコープをトリアージ（5分以内）
    │
    ├── Must: 今日リリースに絶対必要
    ├── Should: できれば含めたい
    ├── Could: 余裕があれば
    └── Won't: 今回は含めない（次スプリントの backlog へ）
    │
    ▼
「Must のみ」で実装スコープを再定義
    │
    ▼
既存 PBI を更新 or 新規 PBI 作成（Won't は backlog ラベルに変更）
    │
    ▼
実装 → CI → マージ → リリース
```

### AI エージェントへの指示テンプレート

要件変更が生じた際は、以下の形式で AI に指示する：

```
## 要件変更の通知
変更内容: {何が変わったか}
リリース期限: {いつまでに出す必要があるか}
Must（絶対必要）: {今日リリースに必須の機能}
Won't（今回除外）: {スコープアウトする機能}
既存 PBI への影響: {更新・クローズすべき Issue 番号}
```

### スコープ調整の判断基準

| 状況 | アクション |
|------|-----------|
| 残り時間 > 工数見積もり | 予定通り全スコープで実装 |
| 残り時間 ≈ 工数見積もり | Should を Won't に移してリスクヘッジ |
| 残り時間 < 工数見積もり | Must のみに絞り、残りを次スプリントへ |
| 残り時間 << 工数見積もり | PBI を分割し、最小動作単位を今スプリントでリリース |

---

## 4. ② 不定期観測・振り返りの仕組み

### 自動計測（GitHub Actions）

以下のワークフローが自動で動作する（`.github/workflows/measure-cycle-time.yml`）：

1. **作業開始時**: `in-progress` ラベルが付与された瞬間、Issue に開始タイムスタンプをコメント
   - GH Actions は非同期で遅延する場合があるため、AI は `in-progress` ラベル付与直後に手動でも同コメントを投稿する（`.claude/CLAUDE.md` 参照）
2. **作業終了時**: PR がマージされた瞬間、以下を自動実行：
   - Issue にサイクルタイムレポートをコメント投稿
   - Project ボードの `Cycle Time (h)` フィールドを更新
   - Project ボードの `Sprint #` フィールドを更新（PR 本文の `Sprint: N` から）
   - Project ボードの `Story Points` フィールドを更新（`size:` ラベルから）

### velocity-log.json の手動補記タイミング

GH Actions（`update-velocity.yml`）が PR マージ時に velocity-log.json を自動更新する。
AI が手動で velocity-log.json を編集する場合は、**GH Actions の完了を待ってから**行うこと。

- GH Actions の完了確認: `gh run list --workflow=update-velocity.yml --limit=3`
- 目安: PRマージから **2〜3分後** に Actions が完了する
- 競合を防ぐため、Actions 完了前に手動編集した場合は `git pull --rebase origin main` で解消する

### 複数 Issue を同一 PR でクローズする場合のサイクルタイム計測方針

1つの PR が複数の `Closes #N` を含む場合（例: 関連する2つのIssueを同一ブランチで解決）：

- GH Actions は **すべての Issue に同一のサイクルタイムを記録**する（PR マージ時刻基準）
- velocity-log.json には各 Issue を個別エントリとして記録し、`cycle_time_hours` は同値になる
- **推奨**: 原則 1 PBI = 1 PR とし、複数 Issue をまとめる場合は PR 本文に理由を明記する

### Project ボードのフィールド定義（SSOT）

| フィールド | ID | 更新タイミング |
|-----------|-----|--------------|
| `Sprint #` | `PVTF_lAHOA-qlQM4BWtuozhSdS10` | PR マージ時（GH Actions）/ スプリントクロージング時（AI） |
| `Story Points` | `PVTF_lAHOA-qlQM4BWtuozhSdS2Q` | PR マージ時（GH Actions）/ バックフィル時（AI） |
| `Cycle Time (h)` | `PVTF_lAHOA-qlQM4BWtuozhSdS2U` | PR マージ時（GH Actions）/ バックフィル時（AI） |
| `Status` | `PVTSSF_lAHOA-qlQM4BWtuozhR_pd4` | ラベル変更時（GH Actions `project-board-sync.yml`） |

Project ID: `PVT_kwHOA-qlQM4BWtuo`

### 手動振り返り（スプリントレビュー）

`スプリントレビューをして` コマンドを実行すると AI が以下を実施する：

1. 直近マージ済み PR のサイクルタイム一覧を集計
2. 前スプリントの Retro Issue を読み込み、前回 Try の実行状況を確認
3. `.github/retrospective-template.md` に基づいて「Retro: Sprint #N」Issue を作成
4. Issue をスプリントボードに登録し、Sprint # フィールドを設定（Status: Done）
5. Try アクションアイテムを個別 Issue（`retro-action` ラベル）として作成し、次スプリントバックログへ追加
6. 完了 PBI に Retro Issue へのリンクを通知コメントとして投稿

### 工数見積もりとの乖離分析

AI は以下の指標を週次でレポートする（`スプリントの状況を確認して` 実行時）：

```
先週の実績:
  完了 PBI 数: X 件
  平均サイクルタイム: Xh
  size: S の平均: Xh
  size: M の平均: Xh
  size: L の平均: Xh

乖離パターン:
  - 見積もりより長かった PBI: #{番号}（{size} → 実績 {X}h）
  - ブロックが発生した回数: X 回
  - ブロックの主な原因: {環境・仕様不明・依存など}
```

---

## 5. ③ 最新の共通ルール構成（SSOT マップ）

AI エージェントは以下のファイルを「唯一の真実の源泉」として参照すること。
**矛盾が生じた場合は、このマップの優先順位（上が高い）に従う。**

| 優先 | ファイル | 用途 |
|------|---------|------|
| 1 | `.github/sprint-protocol.md` | 開発体制・意思決定・スプリント定義（本ファイル） |
| 2 | `.github/pull-request-instructions.md` | PR 生成の論理ルール |
| 3 | `.github/commit-message-instructions.md` | コミットメッセージ規約 |
| 4 | `.claude/CLAUDE.md` | Claude Code 固有の動作定義（上記への参照を含む） |
| 5 | `docs/PRD/product_requirements.md` | プロダクト要件・優先度 |
| 6 | `docs/design/` | UI/UX・設計ドキュメント |

### ドキュメントの鮮度を保つルール

- **要件変更のたびに `docs/PRD/` を更新する**（実装だけ変えてドキュメントを放置しない）
- **設計変更のたびに `docs/design/` を更新する**
- 「このドキュメント、実態と違う」と気づいたら即座に修正し、コミットメッセージに `docs: ` を付ける
- AI エージェントは矛盾を発見したらユーザーに報告してから作業を進める

---

## 6. ④ GitHub ボード運用：動的な優先順位管理

ボード URL: https://github.com/users/yyamamoto95/projects/1

### ラベルによる状態管理

| ラベル | 意味 | 誰が付与 |
|--------|------|---------|
| `backlog` | 未着手・優先度未定 | 人間/AI |
| `sprint-backlog` | 今スプリントで着手予定 | 人間（スプリントプランニング時） |
| `in-progress` | 現在実装中（サイクルタイム計測開始） | AI（スプリント開始時） |
| `in-review` | PR 作成済み・レビュー待ち | AI（PR 作成後） |
| `retro` | スプリントレトロスペクティブ Issue | AI（スプリントクロージング時） |
| `retro-action` | レトロから生まれた改善アクション PBI | AI（スプリントクロージング時） |

### 要件変更時のボード操作

```
要件変更発生
  │
  ├── 新規 PBI: sprint-backlog に追加 → 既存 sprint-backlog から Won't を backlog に戻す
  ├── 優先度変更: priority ラベルを付け替える（P0/P1/P2/P3）
  └── スコープアウト: backlog に移動（クローズしない。ビジネス価値は消えていない）
```

### 「何を捨て、何を優先したか」を1行で残す

要件変更でスコープアウトした場合は、元の Issue にコメントを残す：

```
スコープアウト: {日付}
理由: {何のためにこのPBIを後回しにしたか}
代わりに優先: #{Issue番号}
```

---

## 7. スプリントイベント定義

### スプリントプランニング（`スプリントプランニングをして`）

1. `sprint-backlog` ラベルの PBI を取得し、優先度・サイズ・依存関係を評価
2. 1スプリント（1作業日）で完了可能か判断
3. 完了不可なら PBI 分割を提案
4. **スプリントゴール・仮説を導出する**（PBI選定後に必ず実施）:
   - 選定 PBI 群の共通テーマを抽出する
   - プロダクト3軸（即時フィードバック / 客観的比較 / 継続設計）のいずれかに対応付ける
   - `goal`: 「このスプリントで○○を実現する」形式で1文に要約する
   - `hypothesis`: 「○○することで△△が期待できる」形式で仮説を1文で記述する
   - プランニング提示時に goal / hypothesis をユーザーに明示する
   - 承認後、`velocity-log.json` の当スプリントエントリに記録する
5. **pbi_type を判定して velocity-log.json に記録する**（PR マージ後のクロージング時に実施）:
   - Issue タイトルが `fix:` または `bug:` で始まる → `fix`
   - `type: tech-debt` ラベルを持つ → `tech-debt`
   - `type: chore` または `design:` で始まる → `chore`
   - それ以外 → `feature`
6. 承認後、`in-progress` ラベルを付与しサイクルタイム計測を開始

### デイリースタンドアップ（`スプリントの状況を確認して`）

1. `in-progress` の PBI と詰まりポイントを表示
2. 工数見積もりと経過時間の乖離を報告
3. ブロックがあれば解消案を提示

### スプリントレビュー（`スプリントレビューをして`）

1. 完了 PBI の一覧とサイクルタイムを集計（`velocity-log.json` から取得）
2. 前スプリントの Retro Issue（`retro` ラベル）を読み込み、前回 Try の実行状況を確認
3. `.github/retrospective-template.md` に基づいて「Retro: Sprint #N」Issue を作成
4. Issue をスプリントボードに登録（Sprint # / Status: Done フィールドを設定）
5. Try アクションを `retro-action` + `backlog` ラベルで個別 Issue 化し、ボードに追加
6. 完了 PBI に Retro Issue へのリンクを通知コメントとして投稿
7. ベロシティトレンド（直近3スプリント）を表示
8. 次スプリントへの持ち越し PBI を整理

---

## 8. このプロトコルの更新ルール

- このファイル自体の変更は `chore: sprint-protocol` のコミットメッセージで行う
- 体制に大きな変更が生じた場合は PR を立てて変更履歴を残す
- AI が提案する改善案は、ユーザーの承認なしにこのファイルを書き換えてはならない
