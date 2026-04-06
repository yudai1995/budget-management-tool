import type { DataSource } from 'typeorm'
import type { Expense } from '../../domain/models/Expense'
import type { IExpenseRepository } from '../../domain/repositories/IExpenseRepository'
import { BudgetDataModel } from './entity/BudgetDataModel'
import { ExpenseMapper } from './mappers/ExpenseMapper'

export class TypeORMExpenseRepository implements IExpenseRepository {
    constructor(private readonly dataSource: DataSource) {}

    async findAll(): Promise<Expense[]> {
        const dataModels = await this.dataSource.getRepository(BudgetDataModel).find()
        return dataModels.map(ExpenseMapper.toDomain)
    }

    async findById(id: string): Promise<Expense | null> {
        const dataModel = await this.dataSource
            .getRepository(BudgetDataModel)
            .findOne({ where: { id } })
        return dataModel ? ExpenseMapper.toDomain(dataModel) : null
    }

    async save(expense: Expense): Promise<Expense> {
        const dataModel = ExpenseMapper.toDataModel(expense)
        const saved = await this.dataSource.getRepository(BudgetDataModel).save(dataModel)
        return ExpenseMapper.toDomain(saved)
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
