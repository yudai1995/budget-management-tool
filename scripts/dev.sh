#!/usr/bin/env bash
# ============================================================
# dev.sh — 一括開発起動スクリプト
# 使用方法:
#   pnpm dev                        — 全スタック起動
#   pnpm dev -- --filter @budget/api — API のみ起動（turbo フィルタ）
# 実行順序:
#   1. .env の確認（なければ .env.example からコピー）
#   2. docker compose up -d（DB 起動）
#   3. pnpm run codegen（OpenAPI 型定義の最新化）
#   4. turbo run dev（apps/api + apps/web 並列起動）
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

# OpenAPI スペックと型定義を最新化
echo "[dev] codegen を実行しています..."
pnpm run codegen

# 全アプリを並列起動（追加引数はそのまま turbo に転送）
echo "[dev] アプリを起動しています..."
exec turbo run dev "$@"
