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
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 honoapi

# ビルド成果物のみコピー（ソースは含めない）
COPY --from=builder /repo/apps/api/build ./build
COPY --from=builder /repo/apps/api/node_modules ./node_modules
COPY --from=builder /repo/apps/api/prisma ./prisma
# Prisma クライアントは node_modules に含まれるが、スキーマファイルが必要
COPY --from=builder /repo/packages/common/dist ./packages/common/dist

USER honoapi

EXPOSE 3001
ENV PORT=3001

CMD ["node", "build/index.js"]
