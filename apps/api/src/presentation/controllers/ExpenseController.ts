import { createExpenseSchema } from '@budget/common';
import type { CreateExpenseInput } from '@budget/common';
import type { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase';
import type { Expense } from '../../domain/models/Expense';
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { ValidationError } from '../errors';

export class ExpenseController {
    constructor(
        private readonly expenseRepository: IExpenseRepository,
        private readonly createExpenseUseCase: CreateExpenseUseCase
    ) {}

    async all(): Promise<Expense[]> {
        return this.expenseRepository.findAll();
    }

    async one(id: string): Promise<Expense | null> {
        return this.expenseRepository.findById(id);
    }

    /** Zod でバリデーションし、不正な入力は ValidationError を throw する */
    async save(input: unknown): Promise<Expense> {
        const result = createExpenseSchema.safeParse(input);
        if (!result.success) {
            throw new ValidationError(result.error.message);
        }
        // TypeScript 4.9.5 での safeParse 後の型推論の制限を回避するため明示的にキャスト
        return this.createExpenseUseCase.execute(result.data as unknown as CreateExpenseInput);
    }

    async remove(id: string): Promise<void> {
        return this.expenseRepository.remove(id);
    }
}
