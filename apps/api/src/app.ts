import { OpenAPIHono } from '@hono/zod-openapi';
import type { IBudgetRepository } from './domain/repositories/IBudgetRepository';
import type { IExpenseRepository } from './domain/repositories/IExpenseRepository';
import type { IUserRepository } from './domain/repositories/IUserRepository';
import type { IRefreshTokenRepository } from './domain/repositories/IRefreshTokenRepository';
import { TokenService } from './application/auth/TokenService';
import { DomainException } from './shared/errors/DomainException';
import { createAuthRoutes } from './presentation/routes/auth';
import { createBudgetRoutes } from './presentation/routes/budget';
import { createExpenseRoutes } from './presentation/routes/expense';
import { createUserRoutes } from './presentation/routes/user';

export type AppDeps = {
    userRepository: IUserRepository;
    expenseRepository: IExpenseRepository;
    budgetRepository: IBudgetRepository;
    refreshTokenRepository: IRefreshTokenRepository;
};

/** Hono context の型変数定義（認証済みルートで userId を参照するために使用） */
export type HonoEnv = {
    Variables: {
        userId: string;
    };
};

export function createApp(deps: AppDeps) {
    const privateKeyPem = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '';
    const publicKeyPem = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') ?? '';
    const tokenService = new TokenService(privateKeyPem, publicKeyPem, deps.refreshTokenRepository);

    const app = new OpenAPIHono<HonoEnv>();

    // JWT Bearer 認証スキームをレジストリに登録（createRoute の security: [{ bearerAuth: [] }] と対応）
    app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    });

    app.route('/api', createAuthRoutes(deps, tokenService));
    app.route('/api', createExpenseRoutes(deps, tokenService));
    app.route('/api', createBudgetRoutes(deps, tokenService));
    app.route('/api', createUserRoutes(deps, tokenService));

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
