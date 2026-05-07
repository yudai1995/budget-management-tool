import type { Expense } from '../../domain/models/Expense';
import type { ExpenseDto } from '../dto/ExpenseDto';

/** Expense ドメインモデルをレスポンス用 DTO に変換する */
export function toExpenseDto(e: Expense): ExpenseDto {
    return {
        id: e.id,
        amount: e.amount,
        balanceType: e.balanceType,
        userId: e.userId,
        categoryId: e.categoryId,
        content: e.content,
        date: e.date,
        createdDate: e.createdDate.toISOString(),
        updatedDate: e.updatedDate.toISOString(),
        deletedDate: e.deletedDate?.toISOString() ?? null,
    };
}
