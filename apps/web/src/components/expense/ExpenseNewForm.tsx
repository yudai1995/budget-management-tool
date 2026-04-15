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

export function ExpenseNewForm({ userId, defaultDate }: Props) {
  const [balanceType, setBalanceType] = useState<0 | 1>(0);
  const [categoryId, setCategoryId] = useState(0);
  const [state, formAction, isPending] = useActionState(
    createExpenseAction,
    initialState,
  );
  const categories = getCategoriesByType(balanceType);

  const toggleType = () => {
    const next: 0 | 1 = balanceType === 0 ? 1 : 0;
    setBalanceType(next);
    setCategoryId(0);
  };

  return (
    <section className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-center text-sm font-semibold text-zinc-700">
        収支の入力
      </h2>

      {/* スライドタブ（支出 / 収入） */}
      <button
        type="button"
        role="switch"
        aria-checked={balanceType === 1}
        aria-label={balanceType === 0 ? "支出" : "収入"}
        onClick={toggleType}
        className="relative mx-auto mb-8 block h-12 w-[200px] cursor-pointer"
      >
        {/* 背景レール */}
        <span className="absolute inset-0 flex overflow-hidden rounded border border-zinc-300 bg-zinc-100">
          <span className="flex flex-1 items-center justify-center text-sm text-[var(--color-brand-primary)]">
            支出
          </span>
          <span className="flex flex-1 items-center justify-center text-sm text-[var(--color-brand-primary)]">
            収入
          </span>
        </span>
        {/* スライドするサークル */}
        <span
          className={[
            "absolute top-[4px] flex h-[calc(100%-8px)] w-[calc(50%-4px)] items-center justify-center rounded bg-[var(--color-brand-primary)] text-sm font-medium text-white transition-all duration-200",
            balanceType === 0 ? "left-[4px]" : "left-[50%]",
          ].join(" ")}
        >
          {balanceType === 0 ? "支出" : "収入"}
        </span>
      </button>

      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="balanceType" value={balanceType} />
        <input type="hidden" name="categoryId" value={categoryId} />

        {/* 2カラムレイアウト（モバイルは1カラム） */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 左カラム: 日付・金額・内容 */}
          <div>
            {/* 日付 */}
            <div className="flex items-center border-b border-zinc-200 py-3">
              <label
                htmlFor="date"
                className="w-12 shrink-0 text-xs text-zinc-500"
              >
                日付
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={defaultDate ?? new Date().toISOString().split("T")[0]}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <FieldError messages={state.fieldErrors?.date} />

            {/* 金額 */}
            <div className="flex items-center border-b border-zinc-200 py-3">
              <label
                htmlFor="amount"
                className="w-12 shrink-0 text-xs text-zinc-500"
              >
                金額
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min={1}
                required
                placeholder="金額をご入力ください"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
            <FieldError messages={state.fieldErrors?.amount} />

            {/* 内容 */}
            <div className="flex items-center border-b border-zinc-200 py-3">
              <label
                htmlFor="content"
                className="w-12 shrink-0 text-xs text-zinc-500"
              >
                内容
              </label>
              <input
                id="content"
                name="content"
                type="text"
                placeholder="内容をご入力ください（任意）"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* 右カラム: カテゴリボタングリッド */}
          <div>
            <p className="mb-2 text-xs text-zinc-500">カテゴリ</p>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={[
                    "rounded border py-3 text-xs font-medium transition-colors",
                    categoryId === cat.id
                      ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                      : "border-zinc-200 bg-white hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] hover:text-white",
                  ].join(" ")}
                  style={categoryId !== cat.id ? { color: cat.color } : undefined}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {state.error && (
          <p className="mt-4 rounded-lg bg-[var(--color-expense-light)] px-3 py-2 text-sm text-[var(--color-expense)]">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="mt-4 rounded-lg bg-[var(--color-income-light)] px-3 py-2 text-sm text-[var(--color-income)]">
            登録しました
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isPending}
            className="w-60 rounded-full bg-[var(--color-brand-primary)] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "登録中..." : "追加する"}
          </button>
        </div>
      </form>
    </section>
  );
}
