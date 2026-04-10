import { serverFetch } from "./client";
import type { BudgetProps } from "@budget/common";

/**
 * JSON シリアライズ後の Budget レスポンス型。
 * Date フィールドは JSON 転送時に string になる。
 */
export type BudgetResponse = Omit<
  BudgetProps,
  "createdDate" | "updatedDate" | "deletedDate"
> & {
  createdDate: string;
  updatedDate: string;
  deletedDate: string | null;
};

export type GetBudgetsResponse = {
  budget: BudgetResponse[];
};

export type GetBudgetResponse = {
  budget: BudgetResponse;
};

/** 全 Budget を取得する（Server Component 用） */
export async function getBudgets(): Promise<GetBudgetsResponse> {
  return serverFetch<GetBudgetsResponse>("/api/budget");
}
