import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseController } from '../../../presentation/controllers/ExpenseController';
import { ValidationError } from '../../../presentation/errors';
import type { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import type { CreateExpenseUseCase } from '../../../application/use-cases/CreateExpenseUseCase';
import type { Expense } from '../../../domain/models/Expense';

const mockExpense: Expense = {
    id: 'test-id',
    amount: 1000,
    balanceType: 0,
    userId: 'user-1',
    date: '2024-01-01',
    content: 'テスト',
};

const mockExpenseRepository: IExpenseRepository = {
    findAll: vi.fn().mockResolvedValue([mockExpense]),
    findById: vi.fn().mockResolvedValue(mockExpense),
    save: vi.fn().mockResolvedValue(mockExpense),
    remove: vi.fn().mockResolvedValue(undefined),
};

const mockCreateExpenseUseCase = {
    execute: vi.fn().mockResolvedValue(mockExpense),
} as unknown as CreateExpenseUseCase;

describe('ExpenseController', () => {
    let controller: ExpenseController;

    beforeEach(() => {
        vi.clearAllMocks();
        controller = new ExpenseController(mockExpenseRepository, mockCreateExpenseUseCase);
    });

    describe('all()', () => {
        it('支出一覧を返す', async () => {
            const result = await controller.all();
            expect(result).toEqual([mockExpense]);
            expect(mockExpenseRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('one()', () => {
        it('指定IDの支出を返す', async () => {
            const result = await controller.one('test-id');
            expect(result).toEqual(mockExpense);
            expect(mockExpenseRepository.findById).toHaveBeenCalledWith('test-id');
        });
    });

    describe('save()', () => {
        const validInput = {
            amount: 1000,
            balanceType: 0,
            userId: 'user-1',
            date: '2024-01-01',
            content: 'テスト',
        };

        it('正常系: 有効なデータで支出を作成する', async () => {
            const result = await controller.save(validInput);
            expect(result).toEqual(mockExpense);
            expect(mockCreateExpenseUseCase.execute).toHaveBeenCalledTimes(1);
        });

        it('異常系: amountが0ならValidationErrorをthrow', async () => {
            await expect(controller.save({ ...validInput, amount: 0 })).rejects.toThrow(ValidationError);
        });

        it('異常系: amountが文字列ならValidationErrorをthrow', async () => {
            await expect(controller.save({ ...validInput, amount: 'abc' })).rejects.toThrow(ValidationError);
        });

        it('異常系: balanceTypeが2ならValidationErrorをthrow', async () => {
            await expect(controller.save({ ...validInput, balanceType: 2 })).rejects.toThrow(ValidationError);
        });

        it('異常系: userIdが空文字ならValidationErrorをthrow', async () => {
            await expect(controller.save({ ...validInput, userId: '' })).rejects.toThrow(ValidationError);
        });

        it('異常系: 入力がnullならValidationErrorをthrow', async () => {
            await expect(controller.save(null)).rejects.toThrow(ValidationError);
        });
    });

    describe('remove()', () => {
        it('指定IDの支出を削除する', async () => {
            await expect(controller.remove('test-id')).resolves.toBeUndefined();
            expect(mockExpenseRepository.remove).toHaveBeenCalledWith('test-id');
        });
    });
});
