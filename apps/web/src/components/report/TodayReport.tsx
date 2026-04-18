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
    <section
      className="rounded-2xl border-2 border-[#1c1410] bg-white p-5"
      style={{ boxShadow: "var(--shadow-pop)" }}
    >
      <h2 className="mb-4 text-center text-sm font-extrabold text-[#1c1410] tracking-wide uppercase">
        本日のレポート
      </h2>

      {/* 収支合計 */}
      <div className="mb-3 rounded-xl border border-[#e8c8b0] bg-[#fffdf5] p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-[#1c1410]/50">収支</span>
          <span
            className="text-xl font-extrabold tabular-nums"
            style={{
              color: balance >= 0 ? "var(--color-income)" : "var(--color-expense)",
            }}
          >
            {balance >= 0 ? "+" : ""}¥{balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 支出・収入内訳 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#fff6ee] p-3">
          <p className="text-xs font-bold text-[#f18840]">支出</p>
          <p className="mt-1 text-base font-extrabold tabular-nums text-[#1c1410]">
            ¥{outgo.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-[#ecfaf8] p-3">
          <p className="text-xs font-bold text-[#35b5a2]">収入</p>
          <p className="mt-1 text-base font-extrabold tabular-nums text-[#1c1410]">
            ¥{income.toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
}
