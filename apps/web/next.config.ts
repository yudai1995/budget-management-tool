import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // コンテナデプロイ用: standalone モードで最小ランタイムを出力
  output: "standalone",
  /** /api/* を Hono バックエンドへプロキシする（開発: localhost:3001、本番: ECS API タスク） */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
