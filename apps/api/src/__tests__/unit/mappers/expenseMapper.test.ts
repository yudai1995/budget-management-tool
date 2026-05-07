import { describe, it, expect } from 'vitest';
import { toExpenseDto } from '../../../presentation/mappers/expenseMapper';
import type { Expense } from '../../../domain/models/Expense';

const baseExpense: Expense = {
    id: 'ulid-001',
    amount: 1000,
    balanceType: 0,
    userId: 'user-001',
    categoryId: 2,
    content: '食費メモ',
    date: '2026-05-08',
    createdDate: new Date('2026-05-08T10:00:00.000Z'),
    updatedDate: new Date('2026-05-08T11:00:00.000Z'),
    deletedDate: null,
};

describe('toExpenseDto', () => {
    it('Expense ドメインモデルを DTO に変換する', () => {
        const dto = toExpenseDto(baseExpense);

        expect(dto.id).toBe('ulid-001');
        expect(dto.amount).toBe(1000);
        expect(dto.balanceType).toBe(0);
        expect(dto.userId).toBe('user-001');
        expect(dto.categoryId).toBe(2);
        expect(dto.content).toBe('食費メモ');
        expect(dto.date).toBe('2026-05-08');
        expect(dto.createdDate).toBe('2026-05-08T10:00:00.000Z');
        expect(dto.updatedDate).toBe('2026-05-08T11:00:00.000Z');
        expect(dto.deletedDate).toBeNull();
    });

    it('deletedDate が存在するとき、ISO 文字列に変換される', () => {
        const expense: Expense = {
            ...baseExpense,
            deletedDate: new Date('2026-05-09T00:00:00.000Z'),
        };

        const dto = toExpenseDto(expense);

        expect(dto.deletedDate).toBe('2026-05-09T00:00:00.000Z');
    });

    it('content が null のとき、null のまま返す', () => {
        const expense: Expense = { ...baseExpense, content: null };

        const dto = toExpenseDto(expense);

        expect(dto.content).toBeNull();
    });

    it('balanceType=1（収入）のとき、正しく変換される', () => {
        const expense: Expense = { ...baseExpense, balanceType: 1 };

        const dto = toExpenseDto(expense);

        expect(dto.balanceType).toBe(1);
    });
});
