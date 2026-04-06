import { NextFunction, Request, Response } from 'express'
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository'

export class BudgetController {
    constructor(private readonly budgetRepository: IBudgetRepository) {}

    async all(request: Request, response: Response, next: NextFunction) {
        return this.budgetRepository.all()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = String(request.params.id)
        return this.budgetRepository.one(id)
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.budgetRepository.save(request.body.newData)
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = String(request.params.id)
        // TODO: delete
        // const budgetToRemove = await this.budgetRepository.findOneBy({
        //   id: request.params.id,
        // });
        // await this.budgetRepository.remove(budgetToRemove);

        return this.budgetRepository.remove(id)
    }
}
