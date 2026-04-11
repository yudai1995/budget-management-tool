import 'reflect-metadata';
import * as path from 'node:path';

if (process.env.NODE_ENV !== 'production') {
    // CWD は turbo 実行時に apps/api/ になるため、リポジトリルートの .env を明示的に指定する
    require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
}

import { serve } from '@hono/node-server';
import { AppDataSource } from './infrastructure/persistence/data-source';
import { buildDeps } from './container';
import { createApp } from './app';

const port = Number(process.env.PORT ?? 3001);

AppDataSource.initialize()
    .then(() => {
        const deps = buildDeps();
        const app = createApp(deps);

        serve({ fetch: app.fetch, port }, () => {
            console.log(`Hono server has started on port ${port}. Open http://localhost:${port}/api/docs`);
        });
    })
    .catch((err: unknown) => {
        console.error('DB 接続に失敗しました:', err);
        process.exit(1);
    });
