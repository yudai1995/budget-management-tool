import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { ValidationError } from '../../presentation/errors';
import { Expense } from '../../domain/models/Expense';
import type { BudgetController } from '../../presentation/controllers/BudgetController';
import type { ExpenseController } from '../../presentation/controllers/ExpenseController';
import type { UserController } from '../../presentation/controllers/UserController';

const mockExpense = Expense.reconstruct({
    id: 'test-id-01',
    amount: 1000,
    balanceType: 0,
    userId: 'user-1',
    categoryId: 1,
    content: 'テスト支出',
    date: '2024-01-01',
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-01'),
    deletedDate: null,
});

const mockUserController = {
    all: vi.fn(),
    one: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    login: vi.fn().mockResolvedValue(true),
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

/** ログイン済みエージェントを返すヘルパー */
async function loginAgent(app: ReturnType<typeof buildApp>) {
    const agent = request.agent(app);
    await agent.post('/api/login').send({ userId: 'user-1', password: 'password123' });
    return agent;
}

describe('GET /api/expense', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockUserController.login).mockResolvedValue(true);
    });

    it('200: 支出一覧を返す', async () => {
        vi.mocked(mockExpenseController.all).mockResolvedValue([mockExpense]);
        const app = buildApp();
        const agent = await loginAgent(app);

        const res = await agent.get('/api/expense');
        expect(res.status).toBe(200);
        expect(res.body.expense).toHaveLength(1);
    });

    it('403: 未認証ならAuth Error', async () => {
        const app = buildApp();
        const res = await request(app).get('/api/expense');
        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Auth Error');
    });

    it('500: リポジトリ例外でエラー', async () => {
        vi.mocked(mockExpenseController.all).mockRejectedValue(new Error('DB error'));
        const app = buildApp();
        const agent = await loginAgent(app);

        const res = await agent.get('/api/expense');
        expect(res.status).toBe(500);
    });
});

describe('POST /api/expense', () => {
    const validBody = {
        newData: {
            amount: 1000,
            balanceType: 0,
            userId: 'user-1',
            date: '2024-01-01',
            content: 'テスト',
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockUserController.login).mockResolvedValue(true);
    });

    it('200: 支出を登録する', async () => {
        vi.mocked(mockExpenseController.save).mockResolvedValue(mockExpense);
        const app = buildApp();
        const agent = await loginAgent(app);

        const res = await agent.post('/api/expense').send(validBody);
        expect(res.status).toBe(200);
        expect(res.body.expense).toBeDefined();
    });

    it('400: バリデーションエラーでZodエラーを返す', async () => {
        vi.mocked(mockExpenseController.save).mockRejectedValue(
            new ValidationError('金額は1以上の値を入力してください')
        );
        const app = buildApp();
        const agent = await loginAgent(app);

        const res = await agent
            .post('/api/expense')
            .send({ newData: { amount: 0, balanceType: 0, userId: 'user-1', date: '2024-01-01' } });
        expect(res.status).toBe(400);
        expect(res.body.result).toBe('error');
    });

    it('403: 未認証ならAuth Error', async () => {
        const app = buildApp();
        const res = await request(app).post('/api/expense').send(validBody);
        expect(res.status).toBe(403);
    });

    it('500: 予期しない例外でエラー', async () => {
        vi.mocked(mockExpenseController.save).mockRejectedValue(new Error('DB error'));
        const app = buildApp();
        const agent = await loginAgent(app);

        const res = await agent.post('/api/expense').send(validBody);
        expect(res.status).toBe(500);
    });
});

describe('DELETE /api/expense/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockUserController.login).mockResolvedValue(true);
    });

    it('200: 支出を削除する', async () => {
        vi.mocked(mockExpenseController.remove).mockResolvedValue(undefined);
        const app = buildApp();
        const agent = await loginAgent(app);

        const res = await agent.delete('/api/expense/test-id-01');
        expect(res.status).toBe(200);
    });

    it('403: 未認証ならAuth Error', async () => {
        const app = buildApp();
        const res = await request(app).delete('/api/expense/test-id-01');
        expect(res.status).toBe(403);
    });
});
