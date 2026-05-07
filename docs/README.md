# docs/ — ドキュメント構成

本ディレクトリはプロジェクトの設計・運用・仕様に関するドキュメントを格納する。

## ディレクトリ構成

```
docs/
  README.md                          # このファイル（ドキュメント索引）
  product-identity.md                # プロダクトビジョン・ミッション（SSOT）
  product-challenges.md              # プロダクトが解決する課題の定義
  core-spec.md                       # コアロジック・UI仕様書（家計の寿命）

  PRD/
    product_requirements.md          # プロダクト要件定義書（PRD）

  arch/
    decision-log.md                  # アーキテクチャ決定記録（ADR）
    auth-decision-log.md             # 認証設計の決定記録
    aws-deployment-architecture.md   # AWS デプロイアーキテクチャ
    issues-and-improvements.md       # 技術的負債・改善課題リスト

  architecture/
    ddd_rules.md                     # DDD 導入ルール・レイヤー責務ガイドライン

  database/
    schema.dbml                      # DB スキーマ定義（自動生成・編集禁止）
                                     # SSOT: apps/api/prisma/schema.prisma

  design/
    README.md                        # デザインドキュメント索引
    data_model.md                    # データモデル設計
    figma-tokens.json                # Figma デザイントークン（SSOT）
    ui_concept.md                    # UI コンセプト・デザイン方針
    review_alignment_with_core_value.md  # コアバリューとの整合性レビュー

  operation/
    auth-security-guide.md           # 認証セキュリティ運用ガイド
    db-update-flow.md                # DB 更新フロー（Prisma スキーマ駆動）
    user-ops.md                      # ユーザー管理操作ガイド
```

## SSOT（Single Source of Truth）マップ

| 情報 | 正規ソース |
|------|---------|
| デザイントークン | `docs/design/figma-tokens.json` |
| DB スキーマ | `apps/api/prisma/schema.prisma` |
| API スキーマ | `packages/api-spec/openapi.yaml` |
| スプリントプロセス | `.github/sprint-protocol.md` |
| コミット規約 | `.github/commit-message-instructions.md` |
| PR 生成ルール | `.github/pull-request-instructions.md` |
| AI 行動規約 | `.claude/CLAUDE.md` |

## 廃止済みドキュメント

以下のファイルは実装完了・状況変化により削除済み。

| ファイル | 削除理由 |
|---------|---------|
| `existing_schema_investigation.md` | 旧 TypeORM 時代の調査メモ。Prisma 移行済み |
| `migration_to_nextjs_plan.md` | Next.js 移行計画。移行完了済み |
| `update_plan_v2026.md` | 旧バージョンアップデート計画。実施完了済み |
| `uiux/wireframes.md` | レガシー React アプリ（`client/`）の解析結果。新フロントエンドへの移植完了 |
