/**
 * OpenAPI 統合テスト（型レベル結合テスト）
 *
 * 【目的】
 * - OpenAPI スペック（packages/api-spec/openapi.json）が実際の API の振る舞いと一致することを検証する
 * - 生成された API クライアント（@budget/api-client）を通じて、型と実際のレスポンスが整合していることを確認する
 *
 * 【検証観点】
 * 1. POST /api/expense のレスポンスが ExpenseResponse 型に準拠している
 * 2. GET /api/expense のレスポンスが GetExpensesResponse 型に準拠している
 * 3. エラーレスポンスが ErrorResponse 型に準拠している
 * 4. 生成されたスキーマの必須フィールドがすべて実際のレスポンスに含まれている
 */

import { API_PATHS } from '@budget/api-client';
import type { ErrorResponse, ExpenseResponse, GetExpensesResponse } from '@budget/api-client';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase';
import { TypeORMBudgetRepository } from '../../infrastructure/persistence/TypeORMBudgetRepository';
import { TypeORMExpenseRepository } from '../../infrastructure/persistence/TypeORMExpenseRepository';
import { TypeORMUserRepository } from '../../infrastructure/persistence/TypeORMUserRepository';
import { BudgetController } from '../../presentation/controllers/BudgetController';
import { ExpenseController } from '../../presentation/controllers/ExpenseController';
import { UserController } from '../../presentation/controllers/UserController';
import { TestDataSource, resetDatabase, seedTestData } from '../helpers/db';

const dbAvailable = await TestDataSource.initialize()
    .then(() => true)
    .catch(() => false);

const describeIf = dbAvailable ? describe : describe.skip;

/**
 * ExpenseResponse の必須フィールドをすべて持っているかを検証する型ガード。
 * OpenAPI スキーマと実レスポンスの整合性を実行時に確認する。
 */
function isValidExpenseResponse(obj: unknown): obj is ExpenseResponse {
    if (typeof obj !== 'object' || obj === null) return false;
    const e = obj as Record<string, unknown>;
    return (
        typeof e.id === 'string' &&
        typeof e.amount === 'number' &&
        (e.balanceType === 0 || e.balanceType === 1) &&
        typeof e.userId === 'string' &&
        typeof e.categoryId === 'number' &&
        typeof e.date === 'string' &&
        typeof e.createdDate === 'string' &&
        typeof e.updatedDate === 'string' &&
        (e.deletedDate === null || typeof e.deletedDate === 'string')
    );
}

/**
 * ErrorResponse の必須フィールドを検証する型ガード。
 */
function isValidErrorResponse(obj: unknown): obj is ErrorResponse {
    if (typeof obj !== 'object' || obj === null) return false;
    const e = obj as Record<string, unknown>;
    return e.result === 'error' && typeof e.message === 'string';
}

describeIf('OpenAPI 結合テスト: スキーマと実レスポンスの整合性検証', () => {
    const userRepo = new TypeORMUserRepository(TestDataSource);
    const expenseRepo = new TypeORMExpenseRepository(TestDataSource);
    const budgetRepo = new TypeORMBudgetRepository(TestDataSource);
    const createExpenseUseCase = new CreateExpenseUseCase(expenseRepo, userRepo);

    const app = createApp(
        {
            userController: new UserController(userRepo),
            expenseController: new ExpenseController(expenseRepo, createExpenseUseCase),
            budgetController: new BudgetController(budgetRepo),
        },
        { sessionSecret: 'openapi-contract-test-secret' }
    );

    afterAll(async () => {
        if (dbAvailable && TestDataSource.isInitialized) {
            await TestDataSource.destroy();
        }
    });

    beforeEach(async () => {
        await resetDatabase();
    });

    async function loginAgent(userId: string) {
        const agent = request.agent(app);
        await agent.post(API_PATHS.LOGIN).send({ userId, password: 'password123' });
        return agent;
    }

    // ──────────────────────────────────────────────────────────────
    // POST /api/expense: レスポンスが ExpenseResponse 型に準拠
    // ──────────────────────────────────────────────────────────────
    it('POST /api/expense のレスポンスが OpenAPI スキーマの ExpenseResponse 型に準拠している', async () => {
        const { users } = await seedTestData({ pattern: 'minimal' });
        const agent = await loginAgent(users[0].userId);

        // API は req.body.newData でデータを受け取る
        const res = await agent.post(API_PATHS.EXPENSE).send({
            newData: {
                amount: 1500,
                balanceType: 0,
                userId: users[0].userId,
                date: '2024-06-01',
                content: 'コントラクトテスト',
            },
        });

        expect(res.status).toBe(200);
        const expense: unknown = res.body.expense;

        // 型ガードで全必須フィールドの存在と型を検証
        expect(isValidExpenseResponse(expense)).toBe(true);

        if (isValidExpenseResponse(expense)) {
            // OpenAPI スキーマの example 値と整合する値であることを確認
            expect(expense.amount).toBe(1500);
            expect(expense.balanceType).toBe(0);
            expect(expense.userId).toBe(users[0].userId);
            // ULID: 26文字の文字列
            expect(expense.id).toHaveLength(26);
        }
    });

    // ──────────────────────────────────────────────────────────────
    // GET /api/expense: レスポンスが GetExpensesResponse 型に準拠
    // ──────────────────────────────────────────────────────────────
    it('GET /api/expense のレスポンスが OpenAPI スキーマの GetExpensesResponse 型に準拠している', async () => {
        const { users } = await seedTestData({ pattern: 'lastMonthHeavyUser' });
        const agent = await loginAgent(users[0].userId);

        const res = await agent.get(API_PATHS.EXPENSE);

        expect(res.status).toBe(200);
        const body: GetExpensesResponse = res.body;

        expect(Array.isArray(body.expense)).toBe(true);
        // すべての要素が ExpenseResponse 型に準拠
        for (const item of body.expense) {
            expect(isValidExpenseResponse(item)).toBe(true);
        }
    });

    // ──────────────────────────────────────────────────────────────
    // エラーレスポンス: ErrorResponse 型に準拠
    // ──────────────────────────────────────────────────────────────
    it('未認証リクエストのエラーレスポンスが OpenAPI スキーマの ErrorResponse 型に準拠している', async () => {
        const res = await request(app).get(API_PATHS.EXPENSE);

        expect(res.status).toBe(403);
        expect(isValidErrorResponse(res.body)).toBe(true);
    });

    it('Zod バリデーションエラーのレスポンスが OpenAPI スキーマの ErrorResponse 型に準拠している', async () => {
        const { users } = await seedTestData({ pattern: 'minimal' });
        const agent = await loginAgent(users[0].userId);

        // amount を -1（最小値 1 未満）にしてバリデーションエラーを発生させる
        const res = await agent.post(API_PATHS.EXPENSE).send({
            newData: {
                amount: -1,
                balanceType: 0,
                userId: users[0].userId,
                date: '2024-06-01',
            },
        });

        expect(res.status).toBe(400);
        expect(isValidErrorResponse(res.body)).toBe(true);
    });
});
