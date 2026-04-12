import type { ExpenseResponse } from "@/lib/api/types";

type Props = {
  expenses: ExpenseResponse[];
};

/** 今日の支出・収入・収支を集計して表示するカード */
export function TodayReport({ expenses }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const todayExpenses = expenses.filter((e) => e.date === today);

  const outgo = todayExpenses
    .filter((e) => e.balanceType === 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const income = todayExpenses
    .filter((e) => e.balanceType === 1)
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = income - outgo;

  return (
    <section className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-center text-sm font-semibold text-zinc-700">
        本日のレポート
      </h2>

      {/* 収支合計 */}
      <div className="mb-3 rounded-lg border border-zinc-100 p-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-zinc-500">収支</span>
          <span
            className={[
              "text-lg font-semibold",
              balance >= 0
                ? "text-[var(--color-income)]"
                : "text-[var(--color-expense)]",
            ].join(" ")}
          >
            ¥ {balance >= 0 ? "" : ""}
            {balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 支出・収入内訳 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-zinc-100 p-3">
          <p className="text-xs text-[var(--color-expense)]">支出</p>
          <p className="mt-1 text-base font-semibold text-zinc-800">
            ¥ {outgo.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-100 p-3">
          <p className="text-xs text-[var(--color-income)]">収入</p>
          <p className="mt-1 text-base font-semibold text-zinc-800">
            ¥ {income.toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
}
