/**
 * 型安全な API クライアント。
 * openapi-typescript で生成された schema.d.ts と openapi-fetch を組み合わせ、
 * パス・リクエストボディ・レスポンス型を自動補完付きで提供する。
 *
 * @example
 * ```ts
 * import { createApiClient } from '@budget/api-client';
 *
 * const client = createApiClient('http://localhost:3001');
 * const { data } = await client.GET('/api/expense');
 * // data は { expense: ExpenseResponse[] } として型付けされる
 * ```
 */
import createFetchClient from 'openapi-fetch';
import type { components, paths } from './schema';

export type { components, paths } from './schema';

/** パス定数（統合テストなどでのハードコーディングを防ぐ） */
export const API_PATHS = {
    LOGIN: '/api/login' as const,
    LOGOUT: '/api/logout' as const,
    EXPENSE: '/api/expense' as const,
    EXPENSE_BY_ID: '/api/expense/{id}' as const,
} satisfies Record<string, keyof paths>;

/**
 * openapi-fetch ベースの型安全 API クライアントを生成する。
 *
 * @param baseUrl - API のベース URL（例: 'http://localhost:3001'）
 * @param init - fetch のデフォルトオプション（Cookie などを追加する場合）
 */
export function createApiClient(baseUrl: string, init?: RequestInit) {
    return createFetchClient<paths>({ baseUrl, ...init });
}

// コンポーネントスキーマの便利な型エイリアス
export type ExpenseResponse = components['schemas']['ExpenseResponse'];
export type CreateExpenseRequest = components['schemas']['CreateExpenseRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type LoginResponse = components['schemas']['LoginResponse'];
export type LogoutResponse = components['schemas']['LogoutResponse'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type GetExpensesResponse = components['schemas']['GetExpensesResponse'];
export type GetExpenseResponse = components['schemas']['GetExpenseResponse'];
