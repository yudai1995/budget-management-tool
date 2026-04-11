import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { createExpenseSchema, loginSchema } from '@budget/common';

// Zod に .openapi() メソッドを追加する（プロトタイプ拡張）
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// ─── 共通スキーマ ───────────────────────────────────────────────

/** セッション Cookie を使用した認証（Bearer ではなく Cookie ベース） */
registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: 'connect.sid',
});

// ─── レスポンス用スキーマ ────────────────────────────────────────

const ExpenseResponseSchema = registry.register(
    'ExpenseResponse',
    z.object({
        id: z.string().openapi({
            description: 'Expense ID (ULID)',
            example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        }),
        amount: z.number().int().openapi({ description: '金額（円）', example: 1000 }),
        balanceType: z.union([z.literal(0), z.literal(1)]).openapi({
            description: '収支区分: 0=支出, 1=収入',
            example: 0,
        }),
        userId: z.string().openapi({ description: 'ユーザーID', example: 'user01' }),
        categoryId: z.number().int().openapi({ description: 'カテゴリID', example: 1 }),
        content: z.string().nullable().openapi({ description: '備考', example: '昼食代' }),
        date: z.string().openapi({ description: '日付 (YYYY-MM-DD)', example: '2024-03-15' }),
        createdDate: z.string().openapi({ description: '作成日時 (ISO 8601)', example: '2024-03-15T12:00:00.000Z' }),
        updatedDate: z.string().openapi({ description: '更新日時 (ISO 8601)', example: '2024-03-15T12:00:00.000Z' }),
        deletedDate: z.string().nullable().openapi({ description: '削除日時 (ISO 8601)', example: null }),
    })
);

const ErrorResponseSchema = registry.register(
    'ErrorResponse',
    z.object({
        result: z.literal('error').openapi({ example: 'error' }),
        message: z.string().openapi({ example: 'Auth Error' }),
    })
);

const LoginResponseSchema = registry.register(
    'LoginResponse',
    z.object({
        result: z.enum(['success', 'failed']).openapi({ example: 'success' }),
        userId: z.string().optional().openapi({ example: 'user01' }),
        message: z.string().optional().openapi({ example: 'ログインに失敗しました' }),
    })
);

const LogoutResponseSchema = registry.register(
    'LogoutResponse',
    z.object({
        result: z.enum(['success', 'error']).openapi({ example: 'success' }),
        message: z.string().openapi({ example: 'Logout Success' }),
    })
);

// 注意: 実際の API は req.body.newData にデータを包んで受け取るため、
//       リクエストボディは { newData: { amount, balanceType, ... } } というラッパー構造になる。
//       createExpenseSchema は @budget/common からの import で型拡張が効かないため
//       ここでは z.object() でラップしてインラインで OpenAPI 用スキーマを定義する。
const CreateExpenseRequestSchema = registry.register(
    'CreateExpenseRequest',
    z.object({
        newData: z
            .object({
                amount: z.number().int().min(1).openapi({ description: '金額（円）', example: 1500 }),
                balanceType: z.union([z.literal(0), z.literal(1)]).openapi({
                    description: '収支区分: 0=支出, 1=収入',
                    example: 0,
                }),
                userId: z.string().min(1).openapi({ description: 'ユーザーID', example: 'user01' }),
                date: z.string().min(1).openapi({ description: '日付 (YYYY-MM-DD)', example: '2024-03-15' }),
                content: z.string().nullable().optional().openapi({ description: '備考', example: '昼食代' }),
            })
            .openapi({ description: '支出データ' }),
    })
);

const LoginRequestSchema = registry.register('LoginRequest', loginSchema);

// ─── 認証ルート ──────────────────────────────────────────────────

registry.registerPath({
    method: 'post',
    path: '/api/login',
    summary: 'ログイン',
    description: 'セッション Cookie を発行する',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': { schema: LoginRequestSchema },
            },
            required: true,
        },
    },
    responses: {
        200: {
            description: 'ログイン成功',
            content: { 'application/json': { schema: LoginResponseSchema } },
        },
        400: {
            description: 'バリデーションエラー',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
        403: {
            description: '認証失敗',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/guest-login',
    summary: 'ゲストログイン',
    description: 'パスワード不要でゲストセッションを発行する',
    tags: ['Auth'],
    responses: {
        200: {
            description: 'ゲストログイン成功',
            content: { 'application/json': { schema: LoginResponseSchema } },
        },
        404: {
            description: 'ゲストユーザーが存在しない',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
        500: {
            description: 'サーバーエラー',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/logout',
    summary: 'ログアウト',
    description: 'セッション Cookie を無効化する',
    tags: ['Auth'],
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'ログアウト成功',
            content: { 'application/json': { schema: LogoutResponseSchema } },
        },
        403: {
            description: '未認証',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

// ─── 支出ルート ──────────────────────────────────────────────────

const GetExpensesResponseSchema = registry.register(
    'GetExpensesResponse',
    z.object({
        expense: z.array(ExpenseResponseSchema),
    })
);

const GetExpenseResponseSchema = registry.register(
    'GetExpenseResponse',
    z.object({
        expense: ExpenseResponseSchema,
    })
);

registry.registerPath({
    method: 'get',
    path: '/api/expense',
    summary: '支出一覧取得',
    tags: ['Expense'],
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: '支出一覧',
            content: { 'application/json': { schema: GetExpensesResponseSchema } },
        },
        403: {
            description: '未認証',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/expense/{id}',
    summary: '支出詳細取得',
    tags: ['Expense'],
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.string().openapi({ description: 'Expense ID (ULID)', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' }),
        }),
    },
    responses: {
        200: {
            description: '支出詳細',
            content: { 'application/json': { schema: GetExpenseResponseSchema } },
        },
        403: {
            description: '未認証',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/expense',
    summary: '支出登録',
    tags: ['Expense'],
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: CreateExpenseRequestSchema },
            },
            required: true,
        },
    },
    responses: {
        200: {
            description: '登録成功',
            content: { 'application/json': { schema: GetExpenseResponseSchema } },
        },
        400: {
            description: 'バリデーションエラー',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
        403: {
            description: '未認証',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/expense/{id}',
    summary: '支出更新',
    tags: ['Expense'],
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.string().openapi({ description: 'Expense ID (ULID)' }),
        }),
        body: {
            content: {
                'application/json': { schema: CreateExpenseRequestSchema },
            },
            required: true,
        },
    },
    responses: {
        200: {
            description: '更新成功',
            content: { 'application/json': { schema: GetExpenseResponseSchema } },
        },
        400: {
            description: 'バリデーションエラー',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
        403: {
            description: '未認証',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/expense/{id}',
    summary: '支出削除',
    tags: ['Expense'],
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.string().openapi({ description: 'Expense ID (ULID)' }),
        }),
    },
    responses: {
        200: {
            description: '削除成功',
            content: { 'application/json': { schema: GetExpenseResponseSchema } },
        },
        403: {
            description: '未認証',
            content: { 'application/json': { schema: ErrorResponseSchema } },
        },
    },
});

export {
    ExpenseResponseSchema,
    CreateExpenseRequestSchema,
    LoginRequestSchema,
    GetExpensesResponseSchema,
    GetExpenseResponseSchema,
    ErrorResponseSchema,
    LoginResponseSchema,
    LogoutResponseSchema,
};
