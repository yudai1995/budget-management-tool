"use server";

import { revalidatePath } from "next/cache";
import { serverFetch, ApiError } from "../api/client";
import type { CreateExpenseInput } from "@budget/common";
import type { GetExpenseResponse } from "../api/types";

export type ExpenseActionState = {
  error: string | null;
  success: boolean;
};

/** 支出を新規作成する Server Action */
export async function createExpenseAction(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const amount = Number(formData.get("amount"));
  const balanceType = Number(formData.get("balanceType")) as 0 | 1;
  const userId = formData.get("userId");
  const date = formData.get("date");
  const content = formData.get("content") || null;

  if (!amount || amount <= 0) {
    return { error: "金額は1以上の値を入力してください", success: false };
  }
  if (!userId || !date) {
    return { error: "必須項目を入力してください", success: false };
  }

  const input: CreateExpenseInput = {
    amount,
    balanceType,
    userId: String(userId),
    date: String(date),
    content: content ? String(content) : null,
  };

  try {
    await serverFetch<GetExpenseResponse>("/api/expense", {
      method: "POST",
      body: JSON.stringify({ newData: input }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) {
        return { error: "認証が必要です", success: false };
      }
    }
    return { error: "支出の登録に失敗しました", success: false };
  }

  revalidatePath("/expenses");
  return { error: null, success: true };
}

/** 支出を削除する Server Action */
export async function deleteExpenseAction(id: string): Promise<void> {
  await serverFetch(`/api/expense/${id}`, { method: "DELETE" });
  revalidatePath("/expenses");
}
