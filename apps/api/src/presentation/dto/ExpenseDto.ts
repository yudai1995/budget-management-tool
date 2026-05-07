/** レスポンス用 Expense DTO */
export type ExpenseDto = {
    id: string;
    amount: number;
    balanceType: 0 | 1;
    userId: string;
    categoryId: number;
    content: string | null;
    date: string;
    createdDate: string;
    updatedDate: string;
    deletedDate: string | null;
};
