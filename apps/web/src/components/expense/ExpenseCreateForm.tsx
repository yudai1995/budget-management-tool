"use client";

import { useActionState } from "react";
import { createExpenseAction } from "@/lib/actions/expense";
import type { ExpenseActionState } from "@/lib/actions/expense";

type Props = {
  /** ログイン中のユーザー ID */
  userId: string;
};

const initialState: ExpenseActionState = { error: null, success: false };

/** フィールドエラーを表示するヘルパー */
function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
      {messages[0]}
    </p>
  );
}

export function ExpenseCreateForm({ userId }: Props) {
  const [state, formAction, isPending] = useActionState(
    createExpenseAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        新規登録
      </h2>

      {/* hidden field: userId */}
      <input type="hidden" name="userId" value={userId} />

      <div className="flex gap-3">
        {/* 収支区分 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="balanceType" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            種別
          </label>
          <select
            id="balanceType"
            name="balanceType"
            defaultValue="0"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
          >
            <option value="0">支出</option>
            <option value="1">収入</option>
          </select>
          <FieldError messages={state.fieldErrors?.balanceType} />
        </div>

        {/* 金額 */}
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="amount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            金額
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            required
            placeholder="金額を入力"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
          />
          <FieldError messages={state.fieldErrors?.amount} />
        </div>
      </div>

      {/* 日付 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          日付
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
        />
        <FieldError messages={state.fieldErrors?.date} />
      </div>

      {/* 内容（任意） */}
      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          内容（任意）
        </label>
        <input
          id="content"
          name="content"
          type="text"
          placeholder="内容を入力（任意）"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          登録しました
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "登録中..." : "追加する"}
      </button>
    </form>
  );
}
