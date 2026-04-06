import type { DataSource } from 'typeorm'
import type { Budget } from '../../domain/models/Budget'
import type { IBudgetRepository } from '../../domain/repositories/IBudgetRepository'
import { BudgetDataModel } from './entity/BudgetDataModel'
import { BudgetMapper } from './mappers/BudgetMapper'

export class TypeORMBudgetRepository implements IBudgetRepository {
    constructor(private readonly dataSource: DataSource) {}

    async all(): Promise<Budget[]> {
        const dataModels = await this.dataSource.getRepository(BudgetDataModel).find()
        return dataModels.map(BudgetMapper.toDomain)
    }

    async one(id: string): Promise<Budget | null> {
        const dataModel = await this.dataSource
            .getRepository(BudgetDataModel)
            .findOne({ where: { id } })
        if (!dataModel) return null
        return BudgetMapper.toDomain(dataModel)
    }

    async save(budget: unknown): Promise<Budget> {
        const dataModel = await this.dataSource.getRepository(BudgetDataModel).save(budget as BudgetDataModel)
        return BudgetMapper.toDomain(dataModel)
    }

    async remove(id: string): Promise<void> {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(BudgetDataModel)
            .where('id = :id', { id })
            .execute()
    }
}
