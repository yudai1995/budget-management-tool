# ============================================================
# apps/api/Dockerfile — Hono API マルチステージビルド
#
# ステージ:
#   1. base    — pnpm セットアップ
#   2. deps    — 依存関係インストール（workspace 対応）
#   3. builder — TypeScript コンパイル
#   4. runner  — 最小ランタイムイメージ
# ============================================================

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# ─── deps: workspace の依存関係をインストール ────────────────────────────────
FROM base AS deps
WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/common/package.json ./packages/common/

# --ignore-scripts: Docker コンテナに git がないため lefthook install (prepare スクリプト) をスキップ
RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── builder: TypeScript コンパイル + Prisma クライアント生成 ─────────────────
FROM base AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /repo/packages/common/node_modules ./packages/common/node_modules

COPY packages/common ./packages/common
COPY apps/api ./apps/api
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# common をビルド
RUN pnpm --filter @budget/common build

# Prisma クライアント生成
RUN pnpm --filter @budget/api exec prisma generate

# TypeScript ビルド
RUN pnpm --filter @budget/api build

# ─── runner: 最小ランタイム ───────────────────────────────────────────────────
# pnpm ワークスペースは仮想ストア（.pnpm/）へのシンボリックリンクを使用するため、
# monorepo のディレクトリ構造をそのまま維持する必要がある。
# WORKDIR を /repo にして builder と同じパス構成を再現することで symlink が正しく解決される。
FROM node:20-alpine AS runner
WORKDIR /repo

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 honoapi

# pnpm 仮想ストア（.pnpm/）を含むルート node_modules — symlink 解決に必須
COPY --from=builder /repo/node_modules ./node_modules
# per-package node_modules（各パッケージのシンボリックリンクエントリ）
COPY --from=builder /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /repo/packages/common/node_modules ./packages/common/node_modules

# ビルド成果物
COPY --from=builder /repo/apps/api/build ./apps/api/build
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /repo/apps/api/scripts ./apps/api/scripts
COPY --from=builder /repo/packages/common/dist ./packages/common/dist

USER honoapi

EXPOSE 3001
ENV PORT=3001

# WORKDIR が /repo/apps/api のため、build/apps/api/src/index.js が実際のエントリポイント
WORKDIR /repo/apps/api
CMD ["node", "build/apps/api/src/index.js"]
