import { deleteExpenseAction } from "@/lib/actions/expense";
import type { ExpenseResponse } from "@/lib/api/types";

/** 収支区分のラベルと色 */
const BALANCE_TYPE_MAP = {
  0: { label: "支出", className: "text-red-600 dark:text-red-400" },
  1: { label: "収入", className: "text-emerald-600 dark:text-emerald-400" },
} as const;

type Props = {
  expenses: ExpenseResponse[];
};

export function ExpenseList({ expenses }: Props) {
  if (expenses.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        まだ支出が登録されていません
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {expenses.map((expense) => {
        const typeInfo = BALANCE_TYPE_MAP[expense.balanceType];
        const deleteAction = deleteExpenseAction.bind(null, expense.id);
        return (
          <li key={expense.id} className="flex items-center justify-between gap-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {expense.date}
              </span>
              {expense.content && (
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {expense.content}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-0.5">
                <span className={`text-sm font-medium ${typeInfo.className}`}>
                  {typeInfo.label}
                </span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  ¥{expense.amount.toLocaleString()}
                </span>
              </div>
              <form action={deleteAction}>
                <button
                  type="submit"
                  aria-label="削除"
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  ✕
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
