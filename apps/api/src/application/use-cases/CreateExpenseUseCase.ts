import { Expense } from '../../domain/models/Expense'
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository'
import type { IUserRepository } from '../../domain/repositories/IUserRepository'

export interface CreateExpenseInput {
    amount: number
    balanceType: 0 | 1
    userId: string
    categoryId?: number
    content?: string | null
    date: string
}

export class CreateExpenseUseCase {
    constructor(
        private readonly expenseRepository: IExpenseRepository,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(input: CreateExpenseInput): Promise<Expense> {
        // ユーザー存在確認
        const user = await this.userRepository.one(input.userId)
        if (!user) {
            throw new Error(`ユーザーが見つかりません: ${input.userId}`)
        }

        const expense = Expense.create({
            amount: input.amount,
            balanceType: input.balanceType,
            userId: input.userId,
            categoryId: input.categoryId,
            content: input.content,
            date: input.date,
        })

        return this.expenseRepository.save(expense)
    }
}
