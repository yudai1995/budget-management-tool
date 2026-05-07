import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateExpenseUseCase } from '../../../application/use-cases/UpdateExpenseUseCase';
import type { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { Expense } from '../../../domain/models/Expense';
import { NotFoundError } from '../../../shared/errors/DomainException';

const existingExpense = Expense.reconstruct({
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

describe('UpdateExpenseUseCase', () => {
    let useCase: UpdateExpenseUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new UpdateExpenseUseCase(mockExpenseRepo);
    });

    it('正常系: 支出が存在するとき ok=true で更新済み Expense を返す', async () => {
        const updated = Expense.reconstruct({
            id: 'ulid-001',
            userId: 'user-001',
            amount: 2000,
            balanceType: 0,
            categoryId: 1,
            content: '更新後',
            date: '2026-05-08',
            createdDate: new Date('2026-05-08T00:00:00.000Z'),
            updatedDate: new Date(),
            deletedDate: null,
        });
        vi.mocked(mockExpenseRepo.findById).mockResolvedValue(existingExpense);
        vi.mocked(mockExpenseRepo.save).mockResolvedValue(updated);

        const result = await useCase.execute('ulid-001', {
            amount: 2000,
            balanceType: 0,
            categoryId: 1,
            content: '更新後',
            date: '2026-05-08',
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeInstanceOf(Expense);
        }
        expect(mockExpenseRepo.save).toHaveBeenCalledOnce();
    });

    it('異常系: 支出が存在しないとき ok=false で NotFoundError を返す', async () => {
        vi.mocked(mockExpenseRepo.findById).mockResolvedValue(null);

        const result = await useCase.execute('unknown-id', {
            amount: 2000,
            balanceType: 0,
            categoryId: 1,
            content: '更新後',
            date: '2026-05-08',
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toBeInstanceOf(NotFoundError);
        }
        expect(mockExpenseRepo.save).not.toHaveBeenCalled();
    });
});
