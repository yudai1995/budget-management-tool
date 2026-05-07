import { createRoute } from '@hono/zod-openapi';
import type { RouteServices } from '../../app';
import { createOpenAPIApp } from '../../lib/openapi-app';
import { ErrorResponseSchema, UpsertUserSettingsBodySchema, UserSettingsResponseSchema } from '../../openapi/schemas';
import { createAuthMiddleware } from '../middleware/auth';

// ─── Route 定義 ──────────────────────────────────────────────────

const getUserSettingsRoute = createRoute({
    method: 'get',
    path: '/settings',
    tags: ['Settings'],
    summary: 'ユーザー設定取得',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            content: { 'application/json': { schema: UserSettingsResponseSchema } },
            description: 'ユーザー設定（未設定時はデフォルト値を返す）',
        },
        401: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: '未認証',
        },
    },
});

const upsertUserSettingsRoute = createRoute({
    method: 'put',
    path: '/settings',
    tags: ['Settings'],
    summary: 'ユーザー設定保存',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { 'application/json': { schema: UpsertUserSettingsBodySchema } },
            required: true,
        },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: UserSettingsResponseSchema } },
            description: '保存成功',
        },
        400: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: 'バリデーションエラー',
        },
        401: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: '未認証',
        },
    },
});

// ─── Handler 実装 ────────────────────────────────────────────────

export function createSettingsRoutes({
    tokenService,
    getUserSettingsUseCase,
    upsertUserSettingsUseCase,
}: RouteServices) {
    const auth = createAuthMiddleware(tokenService);
    const app = createOpenAPIApp();

    app.use('/settings', auth);

    app.openapi(getUserSettingsRoute, async (c) => {
        const userId = c.get('userId');
        const settings = await getUserSettingsUseCase.execute(userId);
        return c.json(
            {
                totalAssets: settings?.totalAssets ?? 0,
                monthlyIncome: settings?.monthlyIncome ?? 0,
            },
            200
        );
    });

    app.openapi(upsertUserSettingsRoute, async (c) => {
        const userId = c.get('userId');
        const { totalAssets, monthlyIncome } = c.req.valid('json');
        const settings = await upsertUserSettingsUseCase.execute({ userId, totalAssets, monthlyIncome });
        return c.json(
            {
                totalAssets: settings.totalAssets,
                monthlyIncome: settings.monthlyIncome,
            },
            200
        );
    });

    return app;
}
