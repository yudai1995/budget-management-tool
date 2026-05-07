import { serverFetch } from "./client";
import type { BudgetListResponse } from "@budget/api-client";

/** 全 Budget を取得する（Server Component 用） */
export async function getBudgets(): Promise<BudgetListResponse> {
  return serverFetch<BudgetListResponse>("/api/budget");
}
