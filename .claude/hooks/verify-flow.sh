#!/usr/bin/env bash
# =============================================================================
# verify-flow.sh — 作業完了後の品質確認フロー
# 使用方法: bash .claude/hooks/verify-flow.sh
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }
info() { echo -e "${YELLOW}▶ $1${NC}"; }

echo ""
echo "========================================="
echo "  verify-flow: 作業後品質確認チェック"
echo "========================================="
echo ""

# ----------------------------------------------------------
# 1. packages/common ビルド（型定義の生成）
# ----------------------------------------------------------
info "Step 1: packages/common ビルド"
if pnpm --filter @budget/common build 2>&1; then
  pass "packages/common ビルド成功"
else
  fail "packages/common ビルドに失敗しました。型定義を確認してください。"
fi

# ----------------------------------------------------------
# 2. 全パッケージ 型チェック (packages/common → api → web)
# ----------------------------------------------------------
info "Step 2: 全パッケージ型チェック (turbo run type-check)"
if pnpm turbo run type-check 2>&1; then
  pass "全パッケージ型チェック通過"
else
  fail "型エラーが検出されました。tsc --noEmit の出力を確認してください。"
fi

# ----------------------------------------------------------
# 3. 静的解析 (biome / eslint)
# ----------------------------------------------------------
info "Step 3: 静的解析 (turbo run lint)"
# lint は既存の警告があるため --continue-on-error で続行
if pnpm turbo run lint 2>&1; then
  pass "静的解析通過"
else
  echo -e "${YELLOW}⚠️  lint の警告/エラーがあります（既存の警告は許容）${NC}"
fi

# ----------------------------------------------------------
# 4. ビルドテスト (全パッケージ)
# ----------------------------------------------------------
info "Step 4: ビルドテスト (turbo run build)"
echo "  ※ apps/api は DB 接続が必要なためスキップ。packages/common + apps/web のみ検証。"
if pnpm turbo run build --filter=@budget/common --filter=web 2>&1; then
  pass "ビルドテスト通過 (common + web)"
else
  fail "ビルドに失敗しました。エラーを確認してください。"
fi

# ----------------------------------------------------------
# 5. ランタイム起動確認（手動手順の案内）
# ----------------------------------------------------------
echo ""
echo "========================================="
echo "  ランタイム確認（手動）"
echo "========================================="
echo ""
echo "以下のコマンドで FE / BE の起動を個別に確認してください："
echo ""
echo "  【BE (apps/api)】"
echo "    cd apps/api"
echo "    cp .env.example .env  # DB接続情報を設定"
echo "    pnpm run dev           # DB起動後に実行"
echo "    curl http://localhost:3001/api/expense  # 応答確認"
echo ""
echo "  【FE (apps/web)】"
echo "    cd apps/web"
echo "    pnpm run dev"
echo "    open http://localhost:3000  # ブラウザで確認"
echo ""
echo "  【API 疎通確認】"
echo "    curl -X POST http://localhost:3001/api/login \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"userId\":\"Guest\"}'"
echo ""

pass "verify-flow 完了"
