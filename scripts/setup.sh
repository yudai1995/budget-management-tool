#!/usr/bin/env bash
# ============================================================
# setup.sh — 初回セットアップスクリプト
# 使用方法: pnpm run setup
# 実行内容:
#   1. 依存関係のインストール（pnpm install）
#   2. .env の自動生成（.env.example からのコピー）
#   3. DB コンテナの起動と healthcheck 待機
#   4. DB マイグレーションの実行
# ============================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo ""
echo "========================================="
echo "  Budget Management Tool — セットアップ"
echo "========================================="

# ------------------------------------------------------------------
# 1. 依存関係のインストール
# ------------------------------------------------------------------
echo ""
echo "[1/4] 依存関係をインストールしています..."
pnpm install
echo "  ✅ インストール完了"

# ------------------------------------------------------------------
# 2. .env の生成（存在しない場合のみ）
# ------------------------------------------------------------------
echo ""
echo "[2/4] 環境変数ファイルを確認しています..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  → .env を生成しました（.env.example からコピー）"
  echo "  ⚠️  本番環境では SESSION_KEY と GUEST_PASSWORD を変更してください"
else
  echo "  → .env は既に存在します（スキップ）"
fi

# ------------------------------------------------------------------
# 3. DB コンテナの起動と healthcheck 待機
# ------------------------------------------------------------------
echo ""
echo "[3/4] データベースを起動しています..."
docker compose up -d

echo "  → DB の起動を待機中（healthcheck）..."
TIMEOUT=60
ELAPSED=0
until docker inspect --format='{{.State.Health.Status}}' budget_db 2>/dev/null | grep -q "healthy"; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo ""
    echo "  ❌ DB の起動がタイムアウトしました（${TIMEOUT}秒）"
    echo "     docker compose logs db でログを確認してください"
    exit 1
  fi
  printf "."
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
echo ""
echo "  ✅ DB が正常に起動しました"

# ------------------------------------------------------------------
# 4. DB マイグレーションの実行
# ------------------------------------------------------------------
echo ""
echo "[4/4] マイグレーションを実行しています..."
pnpm --filter @budget/api run migration:run
echo "  ✅ マイグレーション完了"

echo ""
echo "========================================="
echo "  ✅ セットアップが完了しました！"
echo ""
echo "  開発を開始するには:"
echo "    pnpm dev"
echo "========================================="
