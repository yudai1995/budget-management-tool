import * as path from 'node:path';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';

if (process.env.NODE_ENV !== 'production') {
    // CWD は turbo 実行時に apps/api/ になるため、リポジトリルートの .env を明示的に指定する
    require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
}

import { serve } from '@hono/node-server';
import { prisma } from './infrastructure/persistence/prisma-client';
import { buildDeps } from './container';
import { createApp } from './app';

// --migrate フラグ: ECS Run Task でマイグレーションのみ実行して終了する
// .bin/ の shell symlink は pnpm + Docker multi-stage build 環境で壊れることがあるため、
// Node.js の require.resolve() で prisma パッケージのパスを解決し、
// Node.js 自身 (process.execPath) で直接実行する。
if (process.argv.includes('--migrate')) {
    try {
        // Node モジュール解決で prisma CLI の実際のパスを取得
        const prismaPkgPath = require.resolve('prisma/package.json');
        const pkgJson = JSON.parse(fs.readFileSync(prismaPkgPath, 'utf-8')) as {
            bin: Record<string, string>;
        };
        const prismaCli = path.resolve(path.dirname(prismaPkgPath), pkgJson.bin.prisma);

        // __dirname = /repo/apps/api/build/apps/api/src のため 4 階層上が WORKDIR /repo/apps/api
        // prisma は CWD/prisma/schema.prisma を自動検出するため CWD を明示する
        const migrationCwd = path.resolve(__dirname, '../../../..');

        console.log(`prisma CLI  : ${prismaCli}`);
        console.log(`cwd         : ${migrationCwd}`);

        execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
            stdio: 'inherit',
            env: process.env,
            cwd: migrationCwd,
        });

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

const port = Number(process.env.PORT ?? 3001);

async function main(): Promise<void> {
    // Prisma 接続確認（DB に疎通できなければ早期終了）
    await prisma.$connect();

    const deps = buildDeps();
    const app = createApp(deps);

    serve({ fetch: app.fetch, port }, () => {
        console.log(`Hono server has started on port ${port}. Open http://localhost:${port}/api/docs`);
    });
}

main().catch((err: unknown) => {
    console.error('DB 接続に失敗しました:', err);
    process.exit(1);
});
