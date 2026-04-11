/**
 * Auth 統合テスト（実 DB 使用）
 *
 * 【前提】
 * - docker-compose.test.yml の db_test コンテナが起動済みであること
 * - 環境変数は vitest.integration.config.ts が .env.test から自動注入する
 *
 * 【冪等性の保証】
 * - beforeEach で resetDatabase() を実行し、各テストが独立した DB 状態から開始する
 * - seedTestData() で動的 ID（ulid）を使用し、固定値は一切ハードコードしない
 */

import { API_PATHS } from '@budget/api-client';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { TypeORMExpenseRepository } from '../../infrastructure/persistence/TypeORMExpenseRepository';
import { TypeORMUserRepository } from '../../infrastructure/persistence/TypeORMUserRepository';
import { TypeORMBudgetRepository } from '../../infrastructure/persistence/TypeORMBudgetRepository';
import { ExpenseController } from '../../presentation/controllers/ExpenseController';
import { UserController } from '../../presentation/controllers/UserController';
import { BudgetController } from '../../presentation/controllers/BudgetController';
import { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase';
import { TestDataSource, resetDatabase, seedTestData } from '../helpers/db';

// DB に接続できない場合はスキップ
const dbAvailable = await TestDataSource.initialize()
    .then(() => true)
    .catch(() => false);

const describeIf = dbAvailable ? describe : describe.skip;

describeIf('Auth 統合テスト（実 DB）', () => {
    // アプリケーションを実 DB のリポジトリ/コントローラで構築
    const userRepo = new TypeORMUserRepository(TestDataSource);
    const expenseRepo = new TypeORMExpenseRepository(TestDataSource);
    const budgetRepo = new TypeORMBudgetRepository(TestDataSource);
    const createExpenseUseCase = new CreateExpenseUseCase(expenseRepo);

    const app = createApp(
        {
            userController: new UserController(userRepo),
            expenseController: new ExpenseController(expenseRepo, createExpenseUseCase),
            budgetController: new BudgetController(budgetRepo),
        },
        { sessionSecret: 'integration-test-secret' }
    );

    beforeAll(async () => {
        if (!dbAvailable) return;
    });

    afterAll(async () => {
        if (dbAvailable && TestDataSource.isInitialized) {
            await TestDataSource.destroy();
        }
    });

    beforeEach(async () => {
        // 各テスト前に DB をリセットし冪等性を担保
        await resetDatabase();
    });

    // ------------------------------------------------------------------
    // POST /api/login — 正常系
    // ------------------------------------------------------------------
    describe('POST /api/login', () => {
        it('正常系: シードされたユーザーでログインできる', async () => {
            // minimal パターンで動的 userId を生成してシード
            const { users } = await seedTestData({ pattern: 'minimal' });
            const { userId } = users[0];

            const res = await request(app).post(API_PATHS.LOGIN).send({ userId, password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.result).toBe('success');
            expect(res.body.userId).toBe(userId);
        });

        it('正常系: ログイン後のセッションで認証が維持される', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const { userId } = users[0];
            const agent = request.agent(app);

            await agent.post(API_PATHS.LOGIN).send({ userId, password: 'password123' });

            // セッション維持確認: 認証が必要なエンドポイントにアクセスできる
            const res = await agent.get(API_PATHS.EXPENSE);
            expect(res.status).toBe(200);
        });

        it('異常系: 存在しないユーザーは 403 を返す', async () => {
            // DB に一切ユーザーが存在しない状態（resetDatabase 済み）
            const res = await request(app)
                .post(API_PATHS.LOGIN)
                .send({ userId: 'nonexistent-user', password: 'password123' });

            expect(res.status).toBe(403);
            expect(res.body.result).toBe('failed');
        });

        it('異常系: パスワードが誤っている場合は 401 を返す', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const { userId } = users[0];

            const res = await request(app).post(API_PATHS.LOGIN).send({ userId, password: 'wrong-password' });

            expect(res.status).toBe(401);
            expect(res.body.result).toBe('failed');
        });

        it('異常系: userId が空文字のとき Zod バリデーションエラー (400) を返す', async () => {
            const res = await request(app).post(API_PATHS.LOGIN).send({ userId: '', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.result).toBe('error');
        });

        it('異常系: password が未指定のとき Zod バリデーションエラー (400) を返す', async () => {
            const res = await request(app).post(API_PATHS.LOGIN).send({ userId: 'some-user' });

            expect(res.status).toBe(400);
            expect(res.body.result).toBe('error');
        });
    });

    // ------------------------------------------------------------------
    // POST /api/logout
    // ------------------------------------------------------------------
    describe('POST /api/logout', () => {
        it('正常系: ログイン済みユーザーがログアウトできる', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = request.agent(app);

            await agent.post(API_PATHS.LOGIN).send({ userId: users[0].userId, password: 'password123' });

            const res = await agent.post(API_PATHS.LOGOUT);
            expect(res.status).toBe(200);
            expect(res.body.result).toBe('success');
        });

        it('異常系: 未ログイン状態でのログアウトは 403 を返す', async () => {
            const res = await request(app).post(API_PATHS.LOGOUT);
            expect(res.status).toBe(403);
        });

        it('正常系: ログアウト後は認証が必要なエンドポイントに 403 で弾かれる', async () => {
            const { users } = await seedTestData({ pattern: 'minimal' });
            const agent = request.agent(app);

            await agent.post(API_PATHS.LOGIN).send({ userId: users[0].userId, password: 'password123' });
            await agent.post(API_PATHS.LOGOUT);

            const res = await agent.get(API_PATHS.EXPENSE);
            expect(res.status).toBe(403);
        });
    });
});
