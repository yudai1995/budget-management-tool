"use server";

import { revalidatePath } from "next/cache";
import { serverFetch, ApiError } from "../api/client";
import type { GetBudgetResponse } from "../api/budget";
import type { BalanceType } from "@budget/common";

export type BudgetActionState = {
  error: string | null;
  success: boolean;
};

type CreateBudgetInput = {
  amount: number;
  balanceType: BalanceType;
  userId: string;
  categoryId: number;
  date: string;
  content: string | null;
};

/** Budget を新規作成する Server Action */
export async function createBudgetAction(
  _prev: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const amount = Number(formData.get("amount"));
  const balanceType = Number(formData.get("balanceType")) as BalanceType;
  const userId = String(formData.get("userId") ?? "");
  const categoryId = Number(formData.get("categoryId") ?? 0);
  const date = String(formData.get("date") ?? "");
  const content = formData.get("content") ? String(formData.get("content")) : null;

  if (!amount || amount <= 0) {
    return { error: "金額は1以上の値を入力してください", success: false };
  }
  if (!userId || !date) {
    return { error: "必須項目を入力してください", success: false };
  }

  const input: CreateBudgetInput = { amount, balanceType, userId, categoryId, date, content };

  try {
    await serverFetch<GetBudgetResponse>("/api/budget", {
      method: "POST",
      body: JSON.stringify({ newData: input }),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return { error: "認証が必要です", success: false };
    }
    return { error: "登録に失敗しました", success: false };
  }

  revalidatePath("/report");
  return { error: null, success: true };
}

/** Budget を削除する Server Action */
export async function deleteBudgetAction(id: string): Promise<void> {
  await serverFetch(`/api/budget/${id}`, { method: "DELETE" });
  revalidatePath("/report");
}
