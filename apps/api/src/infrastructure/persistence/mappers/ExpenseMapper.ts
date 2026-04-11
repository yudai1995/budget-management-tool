import { Expense } from '../../../domain/models/Expense';
import { BudgetDataModel } from '../entity/BudgetDataModel';

export class ExpenseMapper {
    /** インフラモデル → ドメインモデル */
    static toDomain(dataModel: BudgetDataModel): Expense {
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
        });
    }

    /** ドメインモデル → インフラモデル */
    static toDataModel(expense: Expense): BudgetDataModel {
        const dataModel = new BudgetDataModel();
        dataModel.id = expense.id;
        dataModel.amount = expense.amount;
        dataModel.balanceType = expense.balanceType;
        dataModel.userId = expense.userId;
        dataModel.categoryId = expense.categoryId;
        dataModel.content = expense.content;
        dataModel.date = expense.date;
        // createdDate / updatedDate / deletedDate はTypeORMデコレーターが管理
        return dataModel;
    }
}
