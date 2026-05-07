import type { CreateExpenseInput } from '@budget/common';
import { Expense } from '../../domain/models/Expense';
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../shared/errors/DomainException';
import { type Result, ok, err } from '../../shared/types/result';

export type { CreateExpenseInput };

export class CreateExpenseUseCase {
    constructor(
        private readonly expenseRepository: IExpenseRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async execute(input: CreateExpenseInput): Promise<Result<Expense, NotFoundError>> {
        // ユーザー存在確認
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            return err(new NotFoundError(`ユーザーが見つかりません: ${input.userId}`));
        }

        const expense = Expense.create({
            amount: input.amount,
            balanceType: input.balanceType,
            userId: input.userId,
            categoryId: input.categoryId,
            content: input.content,
            date: input.date,
        });

        const saved = await this.expenseRepository.save(expense);
        return ok(saved);
    }
}
