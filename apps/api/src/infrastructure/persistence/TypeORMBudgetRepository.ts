import { DataSource } from 'typeorm'
import { Budget } from '../../domain/models/Budget'
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository'

export class TypeORMBudgetRepository implements IBudgetRepository {
    constructor(private readonly dataSource: DataSource) {}

    async all(): Promise<Budget[]> {
        return this.dataSource.getRepository(Budget).find()
    }

    async one(id: string): Promise<Budget | null> {
        return this.dataSource.getRepository(Budget).findOne({
            where: { id },
        })
    }

    async save(budget: any): Promise<Budget> {
        return this.dataSource.getRepository(Budget).save(budget)
    }

    async remove(id: string): Promise<any> {
        return this.dataSource.createQueryBuilder().delete().from(Budget).where('id = :id', { id }).execute()
    }
}

