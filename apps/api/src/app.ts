import { Hono } from 'hono';
import type { IBudgetRepository } from './domain/repositories/IBudgetRepository';
import type { IExpenseRepository } from './domain/repositories/IExpenseRepository';
import type { IUserRepository } from './domain/repositories/IUserRepository';
import { DomainException } from './shared/errors/DomainException';
import { createAuthRoutes } from './presentation/routes/auth';
import { createBudgetRoutes } from './presentation/routes/budget';
import { createExpenseRoutes } from './presentation/routes/expense';
import { createUserRoutes } from './presentation/routes/user';

export type AppDeps = {
    userRepository: IUserRepository;
    expenseRepository: IExpenseRepository;
    budgetRepository: IBudgetRepository;
};

export type AppOptions = {
    sessionSecret?: string;
};

/** Hono context の型変数定義（認証済みルートで userId を参照するために使用） */
export type HonoEnv = {
    Variables: {
        userId: string;
    };
};

export function createApp(deps: AppDeps, options: AppOptions = {}) {
    const { sessionSecret = process.env.SESSION_KEY ?? 'dev-secret' } = options;

    const app = new Hono<HonoEnv>()
        .route('/api', createAuthRoutes(deps, sessionSecret))
        .route('/api', createExpenseRoutes(deps, sessionSecret))
        .route('/api', createBudgetRoutes(deps, sessionSecret))
        .route('/api', createUserRoutes(deps, sessionSecret));

    app.onError((err, c) => {
        if (err instanceof DomainException) {
            return c.json({ result: 'error', message: err.message }, err.statusCode as 400 | 401 | 403 | 404 | 500);
        }
        console.error('[unhandled error]', err);
        return c.json({ result: 'error', message: 'Something broken' }, 500);
    });

    return app;
}

/** フロントエンドの型安全 RPC クライアント（hono/client の hc<AppType>）で使用する型 */
export type AppType = ReturnType<typeof createApp>;
