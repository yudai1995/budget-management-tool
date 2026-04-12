#!/usr/bin/env bash
# ============================================================
# setup.sh — 初回セットアップスクリプト
# 使用方法: pnpm run setup
# 実行内容:
#   1. 依存関係のインストール（pnpm install）
#   2. .env の自動生成（.env.example からのコピー）
#   3. JWT RSA 鍵ペアと DATABASE_URL の生成（gen:keys）
#   4. DB コンテナの起動と healthcheck 待機
#   5. Prisma マイグレーションの実行（prisma migrate deploy）
#   6. Prisma Client + DBML の生成（prisma generate）
#   7. Seed データの投入
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
echo "[1/7] 依存関係をインストールしています..."
pnpm install
echo "  ✅ インストール完了"

# ------------------------------------------------------------------
# 2. .env の生成（存在しない場合のみ）
# ------------------------------------------------------------------
echo ""
echo "[2/7] 環境変数ファイルを確認しています..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  → .env を生成しました（.env.example からコピー）"
else
  echo "  → .env は既に存在します（スキップ）"
fi

# ------------------------------------------------------------------
# 3. JWT RSA 鍵ペアと DATABASE_URL の生成
#    プレースホルダーを実値に置換する（冪等: 有効な値があればスキップ）
# ------------------------------------------------------------------
echo ""
echo "[3/7] JWT 鍵ペアと DATABASE_URL を設定しています..."
pnpm run gen:keys
echo "  ✅ 環境変数設定完了"

# ------------------------------------------------------------------
# 4. DB コンテナの起動と healthcheck 待機
# ------------------------------------------------------------------
echo ""
echo "[4/7] データベースを起動しています..."
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
# 5. Prisma マイグレーション（prisma migrate deploy）
#    冪等: 適用済みマイグレーションはスキップ
#    DATABASE_URL をルートの .env から読み込んでエクスポート
# ------------------------------------------------------------------
echo ""
echo "[5/7] Prisma マイグレーションを実行しています..."
set -a; source .env; set +a
pnpm --filter @budget/api exec prisma migrate deploy
echo "  ✅ マイグレーション完了"

# ------------------------------------------------------------------
# 6. Prisma Client + DBML の生成
#    schema.prisma から型定義と docs/database/schema.dbml を自動生成
# ------------------------------------------------------------------
echo ""
echo "[6/7] Prisma Client と DBML を生成しています..."
pnpm --filter @budget/api exec prisma generate
echo "  ✅ Prisma Client + docs/database/schema.dbml 生成完了"

# ------------------------------------------------------------------
# 7. Seed データの投入（ゲストユーザー等、アプリ起動に必須なレコード）
# ------------------------------------------------------------------
echo ""
echo "[7/7] Seed データを投入しています..."
pnpm --filter @budget/api run seed
echo "  ✅ Seed 完了"

echo ""
echo "========================================="
echo "  ✅ セットアップが完了しました！"
echo ""
echo "  開発を開始するには:"
echo "    pnpm dev"
echo ""
echo "  DB 設計書を更新するには:"
echo "    pnpm run db:docs"
echo "========================================="
