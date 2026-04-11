#!/bin/bash

# ============================================================
# 作業後自動検証フロー
# 実行順序: type-check → test:unit → test:api → build
# ひとつでも失敗した時点で処理を中断し、コミットを防止する
# ============================================================

set -e  # エラー発生時に即停止

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo ""
echo "🔍 [1/4] 型整合性チェック (pnpm run type-check)..."
if ! pnpm run type-check; then
    echo ""
    echo "❌ 型エラーが検出されました。コミットを中止します。"
    echo "   tsc のエラーを修正してから再実行してください。"
    exit 1
fi
echo "✅ 型チェック: OK"

echo ""
echo "🧪 [2/4] 単体・コンポーネントテスト (pnpm test:unit)..."
if ! pnpm test:unit; then
    echo ""
    echo "❌ ユニットテストが失敗しました。コミットを中止します。"
    echo "   失敗したテストを修正してから再実行してください。"
    exit 1
fi
echo "✅ ユニットテスト: OK"

echo ""
echo "🌐 [3/4] バックエンド API テスト (pnpm test:api)..."
if ! pnpm test:api; then
    echo ""
    echo "❌ API テストが失敗しました。コミットを中止します。"
    echo "   失敗したシナリオを修正してから再実行してください。"
    exit 1
fi
echo "✅ API テスト: OK"

echo ""
echo "🏗️  [4/4] フロントエンドビルド静的解析 (pnpm build)..."
if ! pnpm build; then
    echo ""
    echo "❌ ビルドが失敗しました。コミットを中止します。"
    echo "   ビルドエラーを修正してから再実行してください。"
    exit 1
fi
echo "✅ ビルド: OK"

echo ""
echo "============================================================"
echo "✅ 全チェック通過。コミット可能です。"
echo "============================================================"
exit 0
