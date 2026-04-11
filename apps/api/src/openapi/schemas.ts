/**
 * OpenAPI ドキュメント生成用の共通 Zod スキーマ定義。
 * @hono/zod-openapi の z を使用することで .openapi() メタデータを付与できる。
 *
 * ここで定義したスキーマが HTTP レイヤーの SSOT となる。
 * ルートハンドラーは c.req.valid() でこのスキーマに基づいた型安全なアクセスを行う。
 */
import { z } from '@hono/zod-openapi';

// ─── 共通レスポンス ──────────────────────────────────────────────

export const ErrorResponseSchema = z
    .object({
        result: z.literal('error').openapi({ example: 'error' }),
        message: z.string().openapi({ example: 'エラーメッセージ' }),
    })
    .openapi('ErrorResponse');

export const SuccessResponseSchema = z
    .object({
        result: z.literal('success').openapi({ example: 'success' }),
    })
    .openapi('SuccessResponse');

// ─── 認証 ────────────────────────────────────────────────────────

export const LoginRequestSchema = z
    .object({
        userId: z.string().min(1, 'ユーザーIDを入力してください').openapi({ example: 'user01' }),
        password: z.string().min(1, 'パスワードを入力してください').openapi({ example: '••••••••' }),
    })
    .openapi('LoginRequest');

export const RefreshRequestSchema = z
    .object({
        refreshToken: z.string().min(1, 'refreshToken が必要です').openapi({ example: 'eyJ...' }),
    })
    .openapi('RefreshRequest');

export const LogoutRequestSchema = z
    .object({
        refreshToken: z.string().optional().openapi({ example: 'eyJ...' }),
    })
    .openapi('LogoutRequest');

export const TokenPairResponseSchema = z
    .object({
        result: z.literal('success'),
        accessToken: z.string().openapi({ example: 'eyJhbGciOiJSUzI1NiJ9...' }),
        refreshToken: z.string().openapi({ example: 'eyJhbGciOiJSUzI1NiJ9...' }),
        userId: z.string().openapi({ example: 'user01' }),
    })
    .openapi('TokenPairResponse');

export const LogoutResponseSchema = z
    .object({
        result: z.enum(['success', 'error']).openapi({ example: 'success' }),
        message: z.string().openapi({ example: 'ログアウトしました' }),
    })
    .openapi('LogoutResponse');

// ─── 支出 (Expense) ──────────────────────────────────────────────

export const ExpenseResponseSchema = z
    .object({
        id: z.string().openapi({ description: 'Expense ID (ULID)', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' }),
        amount: z.number().int().openapi({ description: '金額（円）', example: 1000 }),
        balanceType: z.union([z.literal(0), z.literal(1)]).openapi({
            description: '収支区分: 0=支出, 1=収入',
            example: 0,
        }),
        userId: z.string().openapi({ description: 'ユーザーID', example: 'user01' }),
        categoryId: z.number().int().openapi({ description: 'カテゴリID', example: 1 }),
        content: z.string().nullable().openapi({ description: '備考', example: '昼食代' }),
        date: z.string().openapi({ description: '日付 (YYYY-MM-DD)', example: '2024-03-15' }),
        createdDate: z.string().openapi({
            description: '作成日時 (ISO 8601)',
            example: '2024-03-15T12:00:00.000Z',
        }),
        updatedDate: z.string().openapi({
            description: '更新日時 (ISO 8601)',
            example: '2024-03-15T12:00:00.000Z',
        }),
        deletedDate: z.string().nullable().openapi({ description: '削除日時 (ISO 8601)', example: null }),
    })
    .openapi('ExpenseResponse');

export const CreateExpenseBodySchema = z
    .object({
        newData: z
            .object({
                amount: z
                    .number({ invalid_type_error: '金額は数値で入力してください' })
                    .int('金額は整数で入力してください')
                    .min(1, '金額は1以上の値を入力してください')
                    .openapi({ description: '金額（円）', example: 1500 }),
                balanceType: z
                    .union([z.literal(0), z.literal(1)], {
                        errorMap: () => ({ message: '種別を選択してください' }),
                    })
                    .openapi({ description: '収支区分: 0=支出, 1=収入', example: 0 }),
                userId: z.string().min(1, 'ユーザーIDが必要です').openapi({
                    description: 'ユーザーID',
                    example: 'user01',
                }),
                date: z.string().min(1, '日付を入力してください').openapi({
                    description: '日付 (YYYY-MM-DD)',
                    example: '2024-03-15',
                }),
                content: z.string().nullable().optional().openapi({ description: '備考', example: '昼食代' }),
            })
            .openapi({ description: '支出データ' }),
    })
    .openapi('CreateExpenseBody');

export const IdParamSchema = z.object({
    id: z.string().openapi({ description: 'リソース ID (ULID)', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' }),
});

// ─── 予算 (Budget) ───────────────────────────────────────────────

export const BudgetResponseSchema = z
    .object({
        id: z.string().openapi({ description: 'Budget ID (ULID)', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' }),
        amount: z.number().int().openapi({ description: '金額（円）', example: 1000 }),
        balanceType: z.union([z.literal(0), z.literal(1)]).openapi({
            description: '収支区分: 0=支出, 1=収入',
            example: 0,
        }),
        userId: z.string().openapi({ description: 'ユーザーID', example: 'user01' }),
        categoryId: z.number().int().openapi({ description: 'カテゴリID', example: 1 }),
        content: z.string().nullable().openapi({ description: '備考', example: '食費予算' }),
        date: z.string().openapi({ description: '日付 (YYYY-MM)', example: '2024-03' }),
        createdDate: z.string().openapi({ description: '作成日時 (ISO 8601)' }),
        updatedDate: z.string().openapi({ description: '更新日時 (ISO 8601)' }),
        deletedDate: z.string().nullable().openapi({ description: '削除日時 (ISO 8601)', example: null }),
    })
    .openapi('BudgetResponse');

export const CreateBudgetBodySchema = z
    .object({
        newData: z.record(z.unknown()).openapi({ description: '予算データ' }),
    })
    .openapi('CreateBudgetBody');

// ─── ユーザー (User) ──────────────────────────────────────────────

export const UserResponseSchema = z
    .object({
        userId: z.string().openapi({ description: 'ユーザーID', example: 'user01' }),
        userName: z.string().openapi({ description: 'ユーザー名', example: '山田太郎' }),
    })
    .openapi('UserResponse');

export const CreateUserBodySchema = z
    .object({
        userId: z.string().optional().openapi({ description: 'ユーザーID（省略時自動生成）', example: 'user01' }),
        userName: z.string().min(1).openapi({ description: 'ユーザー名', example: '山田太郎' }),
        password: z.string().min(1).openapi({ description: 'パスワード' }),
    })
    .openapi('CreateUserBody');

export const UpdateUserBodySchema = z
    .object({
        userName: z.string().min(1).openapi({ description: 'ユーザー名', example: '山田太郎' }),
        password: z.string().min(1).openapi({ description: 'パスワード' }),
    })
    .openapi('UpdateUserBody');

export const UserIdParamSchema = z.object({
    userId: z.string().openapi({ description: 'ユーザーID', example: 'user01' }),
});
