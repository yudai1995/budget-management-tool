import type { BalanceType, CreateExpenseInput, ExpenseProps } from "@budget/common";

export type { BalanceType, CreateExpenseInput };

/**
 * JSON シリアライズ後の Expense レスポンス型。
 * Date フィールドは JSON 転送時に string になる。
 */
export type ExpenseResponse = Omit<
  ExpenseProps,
  "createdDate" | "updatedDate" | "deletedDate"
> & {
  createdDate: string;
  updatedDate: string;
  deletedDate: string | null;
};

export type GetExpensesResponse = {
  expense: ExpenseResponse[];
};

export type GetExpenseResponse = {
  expense: ExpenseResponse;
};

export type LoginResponse = {
  result: "success" | "failed";
  userId?: string;
  message?: string;
};

export type LogoutResponse = {
  result: "success" | "error";
  message: string;
};
