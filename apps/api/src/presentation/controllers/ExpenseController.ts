import type { CreateExpenseInput } from '@budget/common'
import type { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase'
import type { Expense } from '../../domain/models/Expense'
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository'

export class ExpenseController {
    constructor(
        private readonly expenseRepository: IExpenseRepository,
        private readonly createExpenseUseCase: CreateExpenseUseCase,
    ) {}

    async all(): Promise<Expense[]> {
        return this.expenseRepository.findAll()
    }

    async one(id: string): Promise<Expense | null> {
        return this.expenseRepository.findById(id)
    }

    async save(input: CreateExpenseInput): Promise<Expense> {
        return this.createExpenseUseCase.execute(input)
    }

    async remove(id: string): Promise<void> {
        return this.expenseRepository.remove(id)
    }
}
