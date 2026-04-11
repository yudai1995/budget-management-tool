/**
 * Expense 統合テスト（実 DB 使用）
 *
 * 【検証範囲】
 * - POST /api/expense: 認証チェック、Zod バリデーション、DB への実際の保存ロジック
 * - GET  /api/expense: 認証チェック、DB からの全件取得
 * - DELETE /api/expense/:id: 認証チェック、DB からの削除
 *
 * 【冪等性】
 * - beforeEach で resetDatabase() を実行し、各テストは独立した状態から開始する
 * - ID は seedTestData() 経由で ulid() により動的に生成する
 */

import { API_PATHS } from '@budget/api-client';
import type { ExpenseResponse, GetExpensesResponse } from '@budget/api-client';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase';
import { TypeORMBudgetRepository } from '../../infrastructure/persistence/TypeORMBudgetRepository';
import { TypeORMExpenseRepository } from '../../infrastructure/persistence/TypeORMExpenseRepository';
import { TypeORMUserRepository } from '../../infrastructure/persistence/TypeORMUserRepository';
import { BudgetController } from '../../presentation/controllers/BudgetController';
import { ExpenseController } from '../../presentation/controllers/ExpenseController';
import { UserController } from '../../presentation/controllers/UserController';
import { TestDataSource, resetDatabase, seedTestData } from '../helpers/db';

// DB に接続できない場合はスキップ
const dbAvailable = await TestDataSource.initialize()
    .then(() => true)
    .catch(() => false);

const describeIf = dbAvailable ? describe : describe.skip;

describeIf('Expense 統合テスト（実 DB）', () => {
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
        { sessionSecret: 'integration-test-secret' }
    );

    afterAll(async () => {
        if (dbAvailable && TestDataSource.isInitialized) {
            await TestDataSource.destroy();
        }
    });

    beforeEach(async () => {
        await resetDatabase();
    });

    /** ログイン済みエージェントを返すヘルパー（seed された userId を使用） */
    async function loginAgent(userId: string) {
        const agent = request.agent(app);
        await agent.post(API_PATHS.LOGIN).send({ userId, password: 'password123' });
        return agent;
    }

    // ------------------------------------------------------------------
    // GET /api/expense
    // ------------------------------------------------------------------
    describe('GET /api/expense', () => {
        it('正常系 200: ログイン済みで全件取得できる', async () => {
            const { users } = await seedTestData({ pattern: 'lastMonthHeavyUser' });
            const agent = await loginAgent(users[0].userId);

            const res = await agent.get(API_PATHS.EXPENSE);
            expect(res.status).toBe(200);
            // 前月 15 件 + 収入 1 件 = 16 件
            expect(res.body.expense).toHaveLength(16);
        });

        it('正常系 200: managerUser シナリオで複数カテゴリの支出を取得できる', async () => {
            const { users, budgets } = await seedTestData({ pattern: 'managerUser' });
            const agent = await loginAgent(users[0].userId);

            const res = await agent.get(API_PATHS.EXPENSE);
            expect(res.status).toBe(200);
            expect(res.body.expense).toHaveLength(budgets.length);

            // 複数カテゴリが含まれていることを確認
            const categoryIds = res.body.expense.map((e: { categoryId: number }) => e.categoryId);
            const uniqueCategories = new Set(categoryIds);
            expect(uniqueCategories.size).toBeGreaterThan(1);
        });

        it('正常系 200: resetDatabase 後は空配列を返す', async () => {
            // beforeEach で resetDatabase 済み。ユーザーだけシードし支出はゼロの状態
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = await loginAgent(users[0].userId);

            const res = await agent.get(API_PATHS.EXPENSE);
            expect(res.status).toBe(200);
            expect(res.body.expense).toHaveLength(0);
        });

        it('異常系 403: 未認証は Auth Error を返す', async () => {
            const res = await request(app).get(API_PATHS.EXPENSE);
            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Auth Error');
        });
    });

    // ------------------------------------------------------------------
    // POST /api/expense — DB 保存ロジックの正常性検証
    // ------------------------------------------------------------------
    describe('POST /api/expense', () => {
        it('正常系 200: 有効なデータが DB に保存され、ID が返される', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = await loginAgent(users[0].userId);
            const today = new Date().toISOString().slice(0, 10);

            const res = await agent.post(API_PATHS.EXPENSE).send({
                newData: {
                    amount: 3000,
                    balanceType: 0,
                    userId: users[0].userId,
                    date: today,
                    content: '統合テスト用支出',
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.expense).toBeDefined();
            // DB に保存された ID は ulid 形式（26文字）
            expect(res.body.expense.id).toHaveLength(26);
            expect(res.body.expense.amount).toBe(3000);
            expect(res.body.expense.userId).toBe(users[0].userId);
        });

        it('正常系 200: 保存後に GET で一覧に反映されている', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = await loginAgent(users[0].userId);
            const today = new Date().toISOString().slice(0, 10);

            await agent.post(API_PATHS.EXPENSE).send({
                newData: {
                    amount: 5000,
                    balanceType: 1,
                    userId: users[0].userId,
                    date: today,
                    content: '収入テスト',
                },
            });

            const listRes = await agent.get(API_PATHS.EXPENSE);
            expect(listRes.status).toBe(200);
            expect(listRes.body.expense).toHaveLength(1);
            expect(listRes.body.expense[0].amount).toBe(5000);
        });

        it('異常系 400: amount が 0 のとき Zod バリデーションエラーを返す', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = await loginAgent(users[0].userId);

            const res = await agent.post(API_PATHS.EXPENSE).send({
                newData: {
                    amount: 0,
                    balanceType: 0,
                    userId: users[0].userId,
                    date: '2024-01-01',
                },
            });

            expect(res.status).toBe(400);
            expect(res.body.result).toBe('error');
        });

        it('異常系 400: balanceType が 0/1 以外のとき Zod バリデーションエラーを返す', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = await loginAgent(users[0].userId);

            const res = await agent.post(API_PATHS.EXPENSE).send({
                newData: {
                    amount: 1000,
                    balanceType: 2, // 不正値
                    userId: users[0].userId,
                    date: '2024-01-01',
                },
            });

            expect(res.status).toBe(400);
            expect(res.body.result).toBe('error');
        });

        it('異常系 403: 未認証は Auth Error を返す', async () => {
            const res = await request(app)
                .post(API_PATHS.EXPENSE)
                .send({
                    newData: { amount: 1000, balanceType: 0, userId: 'user-1', date: '2024-01-01' },
                });
            expect(res.status).toBe(403);
        });

        // edgeCases シナリオ: 実運用のイレギュラーデータでも正常動作することを確認
        it('正常系: edgeCases シナリオのデータが正しく取得できる', async () => {
            const { users, budgets } = await seedTestData({ pattern: 'edgeCases' });
            const agent = await loginAgent(users[0].userId);

            const res = await agent.get(API_PATHS.EXPENSE);
            expect(res.status).toBe(200);
            expect(res.body.expense).toHaveLength(budgets.length);

            // 最小金額（1円）が含まれている
            const minEntry = res.body.expense.find((e: { amount: number }) => e.amount === 1);
            expect(minEntry).toBeDefined();

            // content が null のエントリが含まれている
            const nullContent = res.body.expense.find((e: { content: string | null }) => e.content === null);
            expect(nullContent).toBeDefined();
        });
    });

    // ------------------------------------------------------------------
    // DELETE /api/expense/:id
    // ------------------------------------------------------------------
    describe('DELETE /api/expense/:id', () => {
        it('正常系 200: 指定 ID の支出が DB から削除される', async () => {
            const { users, budgets } = await seedTestData({ pattern: 'minimal' });
            const agent = await loginAgent(users[0].userId);

            // まず支出を 1 件登録
            const today = new Date().toISOString().slice(0, 10);
            const postRes = await agent.post(API_PATHS.EXPENSE).send({
                newData: {
                    amount: 1000,
                    balanceType: 0,
                    userId: users[0].userId,
                    date: today,
                    content: '削除対象',
                },
            });
            const expenseId = postRes.body.expense.id;

            // 削除
            const deleteRes = await agent.delete(`${API_PATHS.EXPENSE}/${expenseId}`);
            expect(deleteRes.status).toBe(200);

            // 削除後は一覧に含まれない
            const listRes = await agent.get(API_PATHS.EXPENSE);
            const ids = listRes.body.expense.map((e: { id: string }) => e.id);
            expect(ids).not.toContain(expenseId);
        });

        it('異常系 403: 未認証は Auth Error を返す', async () => {
            const res = await request(app).delete(`${API_PATHS.EXPENSE}/some-id`);
            expect(res.status).toBe(403);
        });
    });
});
