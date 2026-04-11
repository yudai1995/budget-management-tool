import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';
import { Expense } from '../../domain/models/Expense';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import type { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { TestAgent, testRequest } from '../helpers/testClient';

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

const mockUserRepository = {
    all: vi.fn(),
    one: vi.fn().mockResolvedValue({ userId: 'user-1', userName: 'Test', password: 'hash' }),
    save: vi.fn(),
    remove: vi.fn(),
    login: vi.fn().mockResolvedValue(true),
} as unknown as IUserRepository;

const mockExpenseRepository = {
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
} as unknown as IExpenseRepository;

const mockBudgetRepository = {
    all: vi.fn(),
    one: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
} as unknown as IBudgetRepository;

function buildApp() {
    return createApp(
        {
            userRepository: mockUserRepository,
            expenseRepository: mockExpenseRepository,
            budgetRepository: mockBudgetRepository,
        },
        { sessionSecret: 'test-secret' }
    );
}

/** ログイン済みエージェントを返すヘルパー */
async function loginClient(app: ReturnType<typeof buildApp>) {
    const client = new TestAgent(app);
    await client.post('/api/login', { userId: 'user-1', password: 'password123' });
    return client;
}

describe('GET /api/expense', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockUserRepository.login).mockResolvedValue(true);
    });

    it('200: 支出一覧を返す', async () => {
        vi.mocked(mockExpenseRepository.findAll).mockResolvedValue([mockExpense]);
        const app = buildApp();
        const client = await loginClient(app);

        const res = await client.get('/api/expense');
        expect(res.status).toBe(200);
        expect((res.body as Record<string, unknown[]>).expense).toHaveLength(1);
    });

    it('403: 未認証ならAuth Error', async () => {
        const app = buildApp();
        const res = await testRequest(app, '/api/expense');
        expect(res.status).toBe(403);
        expect((res.body as Record<string, unknown>).message).toBe('Auth Error');
    });

    it('500: リポジトリ例外でエラー', async () => {
        vi.mocked(mockExpenseRepository.findAll).mockRejectedValue(new Error('DB error'));
        const app = buildApp();
        const client = await loginClient(app);

        const res = await client.get('/api/expense');
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
        vi.mocked(mockUserRepository.login).mockResolvedValue(true);
        vi.mocked(mockUserRepository.one).mockResolvedValue({
            userId: 'user-1',
            userName: 'Test',
            password: 'hash',
        } as unknown as ReturnType<IUserRepository['one']> extends Promise<infer T> ? T : never);
    });

    it('200: 支出を登録する', async () => {
        vi.mocked(mockExpenseRepository.save).mockResolvedValue(mockExpense);
        const app = buildApp();
        const client = await loginClient(app);

        const res = await client.post('/api/expense', validBody);
        expect(res.status).toBe(200);
        expect((res.body as Record<string, unknown>).expense).toBeDefined();
    });

    it('400: バリデーションエラーでZodエラーを返す', async () => {
        const app = buildApp();
        const client = await loginClient(app);

        const res = await client.post('/api/expense', {
            newData: { amount: 0, balanceType: 0, userId: 'user-1', date: '2024-01-01' },
        });
        expect(res.status).toBe(400);
        expect((res.body as Record<string, unknown>).result).toBe('error');
    });

    it('403: 未認証ならAuth Error', async () => {
        const app = buildApp();
        const res = await testRequest(app, '/api/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validBody),
        });
        expect(res.status).toBe(403);
    });

    it('500: 予期しない例外でエラー', async () => {
        vi.mocked(mockExpenseRepository.save).mockRejectedValue(new Error('DB error'));
        const app = buildApp();
        const client = await loginClient(app);

        const res = await client.post('/api/expense', validBody);
        expect(res.status).toBe(500);
    });
});

describe('DELETE /api/expense/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockUserRepository.login).mockResolvedValue(true);
    });

    it('200: 支出を削除する', async () => {
        vi.mocked(mockExpenseRepository.remove).mockResolvedValue(undefined);
        const app = buildApp();
        const client = await loginClient(app);

        const res = await client.delete('/api/expense/test-id-01');
        expect(res.status).toBe(200);
    });

    it('403: 未認証ならAuth Error', async () => {
        const app = buildApp();
        const res = await testRequest(app, '/api/expense/test-id-01', { method: 'DELETE' });
        expect(res.status).toBe(403);
    });
});
