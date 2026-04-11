import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';
import { errorModel } from '../../domain/models/errorModel';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import type { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { TestAgent, testRequest } from '../helpers/testClient';

// --- モックリポジトリ ---
const mockUserRepository = {
    all: vi.fn(),
    one: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    login: vi.fn(),
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

describe('POST /api/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('200: 正常ログイン成功', async () => {
        vi.mocked(mockUserRepository.login).mockResolvedValue(true);
        const app = buildApp();

        const res = await testRequest(app, '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-1', password: 'password123' }),
        });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ result: 'success', userId: 'user-1' });
    });

    it('400: userIdが空ならバリデーションエラー', async () => {
        const app = buildApp();

        const res = await testRequest(app, '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: '', password: 'password123' }),
        });

        expect(res.status).toBe(400);
        expect((res.body as Record<string, unknown>).result).toBe('error');
    });

    it('400: passwordが未指定ならバリデーションエラー', async () => {
        const app = buildApp();

        const res = await testRequest(app, '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-1' }),
        });

        expect(res.status).toBe(400);
        expect((res.body as Record<string, unknown>).result).toBe('error');
    });

    it('401: 認証失敗', async () => {
        vi.mocked(mockUserRepository.login).mockResolvedValue(errorModel.AUTHENTICATION_FAILD);
        const app = buildApp();

        const res = await testRequest(app, '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-1', password: 'wrong-pass' }),
        });

        expect(res.status).toBe(401);
        expect((res.body as Record<string, unknown>).result).toBe('failed');
    });

    it('403: ユーザーが見つからない', async () => {
        vi.mocked(mockUserRepository.login).mockResolvedValue(errorModel.NOT_FOUND);
        const app = buildApp();

        const res = await testRequest(app, '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'not-exist', password: 'password123' }),
        });

        expect(res.status).toBe(403);
        expect((res.body as Record<string, unknown>).result).toBe('failed');
    });

    it('500: リポジトリが例外をthrowした場合', async () => {
        vi.mocked(mockUserRepository.login).mockRejectedValue(new Error('DB error'));
        const app = buildApp();

        const res = await testRequest(app, '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-1', password: 'password123' }),
        });

        expect(res.status).toBe(500);
    });
});

describe('POST /api/logout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('200: ログイン済みでログアウト成功', async () => {
        vi.mocked(mockUserRepository.login).mockResolvedValue(true);
        const app = buildApp();
        const client = new TestAgent(app);

        await client.post('/api/login', { userId: 'user-1', password: 'password123' });

        const res = await client.post('/api/logout');
        expect(res.status).toBe(200);
        expect((res.body as Record<string, unknown>).result).toBe('success');
    });

    it('403: 未ログインでログアウト試行', async () => {
        const app = buildApp();

        const res = await testRequest(app, '/api/logout', { method: 'POST' });
        expect(res.status).toBe(403);
    });
});
