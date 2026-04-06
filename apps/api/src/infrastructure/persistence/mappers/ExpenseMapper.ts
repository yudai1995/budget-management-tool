import { Expense } from '../../../domain/models/Expense'
import { ExpenseDataModel } from '../entity/ExpenseDataModel'

export class ExpenseMapper {
    /** インフラモデル → ドメインモデル */
    static toDomain(dataModel: ExpenseDataModel): Expense {
        return Expense.reconstruct({
            id: dataModel.id,
            amount: dataModel.amount,
            balanceType: dataModel.balanceType,
            userId: dataModel.userId,
            categoryId: dataModel.categoryId,
            content: dataModel.content,
            date: dataModel.date,
            createdDate: dataModel.createdDate,
            updatedDate: dataModel.updatedDate,
            deletedDate: dataModel.deletedDate,
        })
    }

    /** ドメインモデル → インフラモデル */
    static toDataModel(expense: Expense): ExpenseDataModel {
        const dataModel = new ExpenseDataModel()
        dataModel.id = expense.id
        dataModel.amount = expense.amount
        dataModel.balanceType = expense.balanceType
        dataModel.userId = expense.userId
        dataModel.categoryId = expense.categoryId
        dataModel.content = expense.content
        dataModel.date = expense.date
        // createdDate / updatedDate / deletedDate はTypeORMデコレーターが管理
        return dataModel
    }
}
