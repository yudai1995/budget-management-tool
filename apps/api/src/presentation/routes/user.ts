import { createRoute, z } from '@hono/zod-openapi';
import { createAuthMiddleware } from '../middleware/auth';
import { createOpenAPIApp } from '../../lib/openapi-app';
import type { TokenService } from '../../application/auth/TokenService';
import type { User } from '../../domain/models/User';
import type { AppDeps } from '../../app';
import {
    CreateUserBodySchema,
    ErrorResponseSchema,
    UpdateUserBodySchema,
    UserIdParamSchema,
    UserResponseSchema,
} from '../../openapi/schemas';

// ─── レスポンス用複合スキーマ ─────────────────────────────────────

const UserListResponseSchema = z.object({ user: z.array(UserResponseSchema) }).openapi('UserListResponse');

const UserDetailResponseSchema = z.object({ user: UserResponseSchema }).openapi('UserDetailResponse');

// ─── Route 定義 ──────────────────────────────────────────────────

const getUsersRoute = createRoute({
    method: 'get',
    path: '/user',
    tags: ['User'],
    summary: 'ユーザー一覧取得',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            content: { 'application/json': { schema: UserListResponseSchema } },
            description: 'ユーザー一覧',
        },
        401: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: '未認証',
        },
    },
});

const getUserRoute = createRoute({
    method: 'get',
    path: '/user/{userId}',
    tags: ['User'],
    summary: 'ユーザー詳細取得',
    security: [{ bearerAuth: [] }],
    request: { params: UserIdParamSchema },
    responses: {
        200: {
            content: { 'application/json': { schema: UserDetailResponseSchema } },
            description: 'ユーザー詳細',
        },
        401: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: '未認証',
        },
        404: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: 'リソースが見つからない',
        },
    },
});

const createUserRoute = createRoute({
    method: 'post',
    path: '/user',
    tags: ['User'],
    summary: 'ユーザー登録',
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: CreateUserBodySchema } }, required: true },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: UserDetailResponseSchema } },
            description: '登録成功',
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

const updateUserRoute = createRoute({
    method: 'put',
    path: '/user/{userId}',
    tags: ['User'],
    summary: 'ユーザー更新',
    security: [{ bearerAuth: [] }],
    request: {
        params: UserIdParamSchema,
        body: { content: { 'application/json': { schema: UpdateUserBodySchema } }, required: true },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: UserDetailResponseSchema } },
            description: '更新成功',
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

const deleteUserRoute = createRoute({
    method: 'delete',
    path: '/user/{userId}',
    tags: ['User'],
    summary: 'ユーザー削除',
    security: [{ bearerAuth: [] }],
    request: { params: UserIdParamSchema },
    responses: {
        200: {
            content: { 'application/json': { schema: z.object({ result: z.literal('success') }) } },
            description: '削除成功',
        },
        401: {
            content: { 'application/json': { schema: ErrorResponseSchema } },
            description: '未認証',
        },
    },
});

// ─── Handler 実装 ────────────────────────────────────────────────

/** パスワードフィールドを除去してユーザー情報を返す */
function sanitizeUser({ userId, userName }: User): { userId: string; userName: string } {
    return { userId, userName };
}

export function createUserRoutes(deps: AppDeps, tokenService: TokenService) {
    const { userRepository } = deps;
    const auth = createAuthMiddleware(tokenService);
    const app = createOpenAPIApp();

    // 全 User ルートに Bearer 認証を適用
    app.use('/user', auth);
    app.use('/user/*', auth);

    app.openapi(getUsersRoute, async (c) => {
        const users = await userRepository.all();
        return c.json({ user: users.map(sanitizeUser) }, 200);
    });

    app.openapi(getUserRoute, async (c) => {
        const { userId } = c.req.valid('param');
        const user = await userRepository.one(userId);
        if (!user) {
            return c.json({ result: 'error' as const, message: 'リソースが見つかりません' }, 404);
        }
        return c.json({ user: sanitizeUser(user) }, 200);
    });

    app.openapi(createUserRoute, async (c) => {
        const { userId, userName, password } = c.req.valid('json');
        const user = await userRepository.save(userId ?? '', userName, password);
        return c.json({ user: sanitizeUser(user) }, 200);
    });

    app.openapi(updateUserRoute, async (c) => {
        const { userId } = c.req.valid('param');
        const { userName, password } = c.req.valid('json');
        const user = await userRepository.save(userId, userName, password);
        return c.json({ user: sanitizeUser(user) }, 200);
    });

    app.openapi(deleteUserRoute, async (c) => {
        const { userId } = c.req.valid('param');
        await userRepository.remove(userId);
        return c.json({ result: 'success' as const }, 200);
    });

    return app;
}
