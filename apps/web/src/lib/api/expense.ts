import { serverFetch } from "./client";
import type { GetExpenseResponse, GetExpensesResponse } from "./types";

/** 全支出を取得する（Server Component 用） */
export async function getExpenses(): Promise<GetExpensesResponse> {
  return serverFetch<GetExpensesResponse>("/api/expense");
}

/** ID を指定して支出を取得する（Server Component 用） */
export async function getExpense(id: string): Promise<GetExpenseResponse> {
  return serverFetch<GetExpenseResponse>(`/api/expense/${id}`);
}
