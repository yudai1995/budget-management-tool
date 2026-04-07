import type { Budget } from '../../domain/models/Budget'
import type { IBudgetRepository } from '../../domain/repositories/IBudgetRepository'

export class BudgetController {
    constructor(private readonly budgetRepository: IBudgetRepository) {}

    async all(): Promise<Budget[]> {
        return this.budgetRepository.all()
    }

    async one(id: string): Promise<Budget | null> {
        return this.budgetRepository.one(id)
    }

    async save(data: unknown): Promise<Budget> {
        return this.budgetRepository.save(data)
    }

    async remove(id: string): Promise<void> {
        // TODO: delete
        // const budgetToRemove = await this.budgetRepository.findOneBy({
        //   id: request.params.id,
        // });
        // await this.budgetRepository.remove(budgetToRemove);

        return this.budgetRepository.remove(id)
    }
}
