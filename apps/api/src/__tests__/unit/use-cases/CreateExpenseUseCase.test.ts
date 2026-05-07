import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateExpenseUseCase } from '../../../application/use-cases/CreateExpenseUseCase';
import type { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/models/User';
import { Expense } from '../../../domain/models/Expense';
import { NotFoundError } from '../../../shared/errors/DomainException';

const mockUser = User.reconstruct({
    userId: 'user-001',
    userName: 'テストユーザー',
    password: 'hashed',
    email: null,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date('2026-05-08T00:00:00.000Z'),
    updatedAt: new Date('2026-05-08T00:00:00.000Z'),
});

const mockExpense = Expense.reconstruct({
    id: 'ulid-001',
    userId: 'user-001',
    amount: 1000,
    balanceType: 0,
    categoryId: 1,
    content: 'テスト支出',
    date: '2026-05-08',
    createdDate: new Date('2026-05-08T00:00:00.000Z'),
    updatedDate: new Date('2026-05-08T00:00:00.000Z'),
    deletedDate: null,
});

const mockExpenseRepo: IExpenseRepository = {
    findAll: vi.fn(),
    findByUserId: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
};

const mockUserRepo: IUserRepository = {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    verifyPassword: vi.fn(),
};

describe('CreateExpenseUseCase', () => {
    let useCase: CreateExpenseUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new CreateExpenseUseCase(mockExpenseRepo, mockUserRepo);
    });

    it('正常系: ユーザーが存在するとき ok=true で Expense を返す', async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser);
        vi.mocked(mockExpenseRepo.save).mockResolvedValue(mockExpense);

        const result = await useCase.execute({
            userId: 'user-001',
            amount: 1000,
            balanceType: 0,
            categoryId: 1,
            content: 'テスト支出',
            date: '2026-05-08',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeInstanceOf(Expense);
        }
        expect(mockExpenseRepo.save).toHaveBeenCalledOnce();
    });

    it('異常系: ユーザーが存在しないとき ok=false で NotFoundError を返す', async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

        const result = await useCase.execute({
            userId: 'unknown-user',
            amount: 1000,
            balanceType: 0,
            categoryId: 1,
            content: 'テスト支出',
            date: '2026-05-08',
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toBeInstanceOf(NotFoundError);
        }
        expect(mockExpenseRepo.save).not.toHaveBeenCalled();
    });
});
