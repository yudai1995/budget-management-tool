import type { NextFunction, Request, Response } from 'express'
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository'
import type { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase'

export class ExpenseController {
    constructor(
        private readonly expenseRepository: IExpenseRepository,
        private readonly createExpenseUseCase: CreateExpenseUseCase,
    ) {}

    async all(_request: Request, _response: Response, _next: NextFunction) {
        return this.expenseRepository.findAll()
    }

    async one(request: Request, _response: Response, _next: NextFunction) {
        const id = String(request.params.id)
        return this.expenseRepository.findById(id)
    }

    async save(request: Request, _response: Response, _next: NextFunction) {
        const { amount, balanceType, userId, categoryId, content, date } = request.body.newData
        return this.createExpenseUseCase.execute({
            amount,
            balanceType,
            userId,
            categoryId,
            content,
            date,
        })
    }

    async remove(request: Request, _response: Response, _next: NextFunction) {
        const id = String(request.params.id)
        return this.expenseRepository.remove(id)
    }
}
