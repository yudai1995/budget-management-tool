import { Budget } from '../../../domain/models/Budget';
import { BudgetDataModel } from '../entity/BudgetDataModel';

export class BudgetMapper {
    /** インフラモデル → ドメインモデル */
    static toDomain(dataModel: BudgetDataModel): Budget {
        return Budget.reconstruct({
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
    static toDataModel(budget: Budget): BudgetDataModel {
        const dataModel = new BudgetDataModel();
        dataModel.id = budget.id;
        dataModel.amount = budget.amount;
        dataModel.balanceType = budget.balanceType;
        dataModel.userId = budget.userId;
        dataModel.categoryId = budget.categoryId;
        dataModel.content = budget.content;
        dataModel.date = budget.date;
        // createdDate / updatedDate / deletedDate はTypeORMデコレーターが管理
        return dataModel;
    }
}
