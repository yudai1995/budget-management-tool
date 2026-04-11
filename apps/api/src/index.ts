import 'reflect-metadata';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
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
