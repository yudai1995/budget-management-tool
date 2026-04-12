#!/usr/bin/env bash
# ============================================================
# dev.sh — 一括開発起動スクリプト
# 使用方法:
#   pnpm dev                        — 全スタック起動
#   pnpm dev -- --filter @budget/api — API のみ起動（turbo フィルタ）
# 実行順序:
#   1. .env の確認（なければ .env.example からコピー）
#   2. docker compose up -d（DB 起動 + healthcheck 待機）
#   3. @budget/common のビルド（ts-node + tsconfig-paths が dist/ を参照）
#   4. DB マイグレーション実行（冪等）
#   5. Seed データ投入（冪等）
#   6. pnpm run codegen（OpenAPI 型定義の最新化）
#   7. turbo run dev（apps/api + apps/web 並列起動）
# ============================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# .env が存在しない場合は自動生成
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[dev] .env を .env.example から生成しました"
fi

# DB コンテナを起動（既に起動中なら冪等）
echo "[dev] DB コンテナを起動しています..."
docker compose up -d

echo "[dev] DB の起動を待機中（healthcheck）..."
TIMEOUT=60
ELAPSED=0
until docker inspect --format='{{.State.Health.Status}}' budget_db 2>/dev/null | grep -q "healthy"; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo ""
    echo "[dev] ❌ DB の起動がタイムアウトしました（${TIMEOUT}秒）"
    exit 1
  fi
  printf "."
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
echo ""

# @budget/common をビルド（ts-node + tsconfig-paths が dist/ を参照するため必須）
echo "[dev] @budget/common をビルドしています..."
pnpm --filter @budget/common run build

# DB マイグレーションを実行（冪等: 適用済みのマイグレーションはスキップ）
echo "[dev] DB マイグレーションを実行しています..."
pnpm --filter @budget/api run migration:run

# Seed データを投入（冪等: 既存レコードはスキップ）
echo "[dev] Seed データを投入しています..."
pnpm --filter @budget/api run seed

# OpenAPI スペックと型定義を最新化
echo "[dev] codegen を実行しています..."
pnpm run codegen

# 全アプリを並列起動（追加引数はそのまま turbo に転送）
echo "[dev] アプリを起動しています..."
exec turbo run dev "$@"
