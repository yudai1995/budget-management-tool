import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { errorModel } from '../../domain/models/errorModel';
import type { BudgetController } from '../../presentation/controllers/BudgetController';
import type { ExpenseController } from '../../presentation/controllers/ExpenseController';
import type { UserController } from '../../presentation/controllers/UserController';

// --- モックコントローラ ---
const mockUserController = {
    all: vi.fn(),
    one: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    login: vi.fn(),
} as unknown as UserController;

const mockExpenseController = {
    all: vi.fn(),
    one: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
} as unknown as ExpenseController;

const mockBudgetController = {
    all: vi.fn(),
    one: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
} as unknown as BudgetController;

function buildApp() {
    return createApp(
        {
            userController: mockUserController,
            expenseController: mockExpenseController,
            budgetController: mockBudgetController,
        },
        { sessionSecret: 'test-secret' }
    );
}

describe('POST /api/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('200: 正常ログイン成功', async () => {
        vi.mocked(mockUserController.login).mockResolvedValue(true);
        const app = buildApp();

        const res = await request(app).post('/api/login').send({ userId: 'user-1', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ result: 'success', userId: 'user-1' });
    });

    it('400: userIdが空ならバリデーションエラー', async () => {
        const app = buildApp();

        const res = await request(app).post('/api/login').send({ userId: '', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.result).toBe('error');
    });

    it('400: passwordが未指定ならバリデーションエラー', async () => {
        const app = buildApp();

        const res = await request(app).post('/api/login').send({ userId: 'user-1' });

        expect(res.status).toBe(400);
        expect(res.body.result).toBe('error');
    });

    it('401: 認証失敗', async () => {
        vi.mocked(mockUserController.login).mockResolvedValue(errorModel.AUTHENTICATION_FAILD);
        const app = buildApp();

        const res = await request(app).post('/api/login').send({ userId: 'user-1', password: 'wrong-pass' });

        expect(res.status).toBe(401);
        expect(res.body.result).toBe('failed');
    });

    it('403: ユーザーが見つからない', async () => {
        vi.mocked(mockUserController.login).mockResolvedValue(errorModel.NOT_FOUND);
        const app = buildApp();

        const res = await request(app).post('/api/login').send({ userId: 'not-exist', password: 'password123' });

        expect(res.status).toBe(403);
        expect(res.body.result).toBe('failed');
    });

    it('500: コントローラが例外をthrowした場合', async () => {
        vi.mocked(mockUserController.login).mockRejectedValue(new Error('DB error'));
        const app = buildApp();

        const res = await request(app).post('/api/login').send({ userId: 'user-1', password: 'password123' });

        expect(res.status).toBe(500);
    });
});

describe('POST /api/logout', () => {
    it('200: ログイン済みでログアウト成功', async () => {
        vi.mocked(mockUserController.login).mockResolvedValue(true);
        const app = buildApp();
        const agent = request.agent(app);

        await agent.post('/api/login').send({ userId: 'user-1', password: 'password123' });

        const res = await agent.post('/api/logout');
        expect(res.status).toBe(200);
        expect(res.body.result).toBe('success');
    });

    it('403: 未ログインでログアウト試行', async () => {
        const app = buildApp();

        const res = await request(app).post('/api/logout');
        expect(res.status).toBe(403);
    });
});
