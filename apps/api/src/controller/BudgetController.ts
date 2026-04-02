import { NextFunction, Request, Response } from 'express'
import { Budget } from '../entity/Budget'
import { AppDataSource } from '../data-source'

export class BudgetController {
    private budgetRepository = AppDataSource.getRepository(Budget)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.budgetRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = String(request.params.id)
        return this.budgetRepository.findOne({
            where: { id },
        })
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

        await AppDataSource.createQueryBuilder().delete().from(Budget).where('id = :id', { id }).execute()
    }
}
