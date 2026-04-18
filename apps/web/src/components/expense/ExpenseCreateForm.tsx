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
    <p className="mt-1 text-xs font-medium text-[#f87171]">{messages[0]}</p>
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
    <section
      id="form"
      className="rounded-2xl border-2 border-[#1c1410] bg-white p-5"
      style={{ boxShadow: "var(--shadow-pop)" }}
    >
      <h2 className="mb-4 text-center text-sm font-extrabold text-[#1c1410] tracking-wide uppercase">
        収支の入力
      </h2>

      {/* 収支タブ */}
      <div className="mb-4 flex rounded-xl border-2 border-[#1c1410] overflow-hidden" style={{ boxShadow: "var(--shadow-pop-sm)" }}>
        <button
          type="button"
          onClick={() => setBalanceType(0)}
          className={[
            "flex-1 py-2 text-sm font-bold transition-colors",
            balanceType === 0
              ? "bg-[#f18840] text-white"
              : "bg-white text-[#1c1410]/50 hover:bg-[#fff6ee]",
          ].join(" ")}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => setBalanceType(1)}
          className={[
            "flex-1 py-2 text-sm font-bold transition-colors",
            balanceType === 1
              ? "bg-[#35b5a2] text-white"
              : "bg-white text-[#1c1410]/50 hover:bg-[#ecfaf8]",
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
          <label htmlFor="amount" className="text-xs font-bold text-[#1c1410]/50">金額</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            required
            placeholder="金額をご入力ください"
            className="input-pop"
          />
          <FieldError messages={state.fieldErrors?.amount} />
        </div>

        {/* 日付 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-xs font-bold text-[#1c1410]/50">日付</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaultDate ?? new Date().toISOString().split("T")[0]}
            className="input-pop"
          />
          <FieldError messages={state.fieldErrors?.date} />
        </div>

        {/* カテゴリ */}
        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-xs font-bold text-[#1c1410]/50">カテゴリ</label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={0}
            className="input-pop"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 内容 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="content" className="text-xs font-bold text-[#1c1410]/50">内容</label>
          <input
            id="content"
            name="content"
            type="text"
            placeholder="内容をご入力ください（任意）"
            className="input-pop"
          />
        </div>

        {state.error && (
          <p className="rounded-xl border border-[#f87171]/40 bg-[#fee2e2] px-3 py-2 text-sm font-medium text-[#1c1410]">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-xl border border-[#35b5a2]/40 bg-[#ecfaf8] px-3 py-2 text-sm font-bold text-[#35b5a2]">
            登録しました
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-candy w-full mt-2 disabled:opacity-50"
        >
          {isPending ? "登録中..." : "追加する"}
        </button>
      </form>
    </section>
  );
}
