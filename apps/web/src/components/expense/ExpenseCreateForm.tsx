"use client";

import { useActionState, useState } from "react";
import { createExpenseAction } from "@/lib/actions/expense";
import type { ExpenseActionState } from "@/lib/actions/expense";
import { getCategoriesByType } from "@/lib/constants/categories";

type Props = {
  /** ログイン中のユーザー ID */
  userId: string;
  /** 初期表示する日付（YYYY-MM-DD 形式。省略時は今日） */
  defaultDate?: string;
};

const initialState: ExpenseActionState = { error: null, success: false };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-xs text-[var(--color-expense)]">{messages[0]}</p>
  );
}

export function ExpenseCreateForm({ userId, defaultDate }: Props) {
  const [balanceType, setBalanceType] = useState<0 | 1>(0);
  const [state, formAction, isPending] = useActionState(
    createExpenseAction,
    initialState,
  );
  const categories = getCategoriesByType(balanceType);

  return (
    <section id="form" className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-center text-sm font-semibold text-zinc-700">
        収支の入力
      </h2>

      {/* 収支タブ */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setBalanceType(0)}
          className={[
            "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
            balanceType === 0
              ? "bg-[var(--color-brand-primary)] text-white"
              : "border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:bg-[var(--color-expense-light)]",
          ].join(" ")}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => setBalanceType(1)}
          className={[
            "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
            balanceType === 1
              ? "bg-[var(--color-income)] text-white"
              : "border border-[var(--color-income)] text-[var(--color-income)] hover:bg-[var(--color-income-light)]",
          ].join(" ")}
        >
          収入
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="balanceType" value={balanceType} />

        {/* 金額 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-xs text-zinc-500">金額</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            required
            placeholder="金額をご入力ください"
            className="border-b border-zinc-300 bg-transparent py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-[var(--color-brand-primary)]"
          />
          <FieldError messages={state.fieldErrors?.amount} />
        </div>

        {/* 日付 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-xs text-zinc-500">日付</label>
          <div className="flex items-center gap-2 border-b border-zinc-300 py-2 focus-within:border-[var(--color-brand-primary)]">
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDate ?? new Date().toISOString().split("T")[0]}
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <FieldError messages={state.fieldErrors?.date} />
        </div>

        {/* カテゴリ */}
        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-xs text-zinc-500">カテゴリ</label>
          <div className="relative border-b border-zinc-300 focus-within:border-[var(--color-brand-primary)]">
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={0}
              className="w-full appearance-none bg-transparent py-2 text-sm text-zinc-700 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="content" className="text-xs text-zinc-500">内容</label>
          <input
            id="content"
            name="content"
            type="text"
            placeholder="内容をご入力ください（任意）"
            className="border-b border-zinc-300 bg-transparent py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-[var(--color-expense-light)] px-3 py-2 text-sm text-[var(--color-expense)]">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg bg-[var(--color-income-light)] px-3 py-2 text-sm text-[var(--color-income)]">
            登録しました
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-full bg-[var(--color-brand-primary)] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "登録中..." : "追加する"}
        </button>
      </form>
    </section>
  );
}
