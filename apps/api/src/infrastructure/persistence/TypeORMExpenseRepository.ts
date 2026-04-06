import { DataSource } from 'typeorm'
import { Expense } from '../../domain/models/Expense'
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository'
import { ExpenseDataModel } from './entity/ExpenseDataModel'
import { ExpenseMapper } from './mappers/ExpenseMapper'

export class TypeORMExpenseRepository implements IExpenseRepository {
    constructor(private readonly dataSource: DataSource) {}

    async findAll(): Promise<Expense[]> {
        const dataModels = await this.dataSource.getRepository(ExpenseDataModel).find()
        return dataModels.map(ExpenseMapper.toDomain)
    }

    async findById(id: string): Promise<Expense | null> {
        const dataModel = await this.dataSource
            .getRepository(ExpenseDataModel)
            .findOne({ where: { id } })
        return dataModel ? ExpenseMapper.toDomain(dataModel) : null
    }

    async save(expense: Expense): Promise<Expense> {
        const dataModel = ExpenseMapper.toDataModel(expense)
        const saved = await this.dataSource.getRepository(ExpenseDataModel).save(dataModel)
        return ExpenseMapper.toDomain(saved)
    }

    async remove(id: string): Promise<void> {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(ExpenseDataModel)
            .where('id = :id', { id })
            .execute()
    }
}
