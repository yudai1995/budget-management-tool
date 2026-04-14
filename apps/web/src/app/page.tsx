import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getExpenses } from "@/lib/api/expense";
import { ApiError } from "@/lib/api/client";
import { Header } from "@/components/layout/Header";
import { TodayReport } from "@/components/report/TodayReport";
import { RecentGraph } from "@/components/report/RecentGraph";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";
import { XDayDisplay } from "@/components/dashboard/XDayDisplay";

export const metadata: Metadata = {
  title: "ホーム | 家計管理",
};

/** 支出リストからXデー算出用の集計値を計算 */
function computeXDayInputs(expenses: { balanceType: number; amount: number; date: string }[]) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);

  const todayExpense = expenses
    .filter((e) => e.balanceType === 0 && e.date === todayStr)
    .reduce((s, e) => s + e.amount, 0);

  const yesterdayExpense = expenses
    .filter((e) => e.balanceType === 0 && e.date === yesterdayStr)
    .reduce((s, e) => s + e.amount, 0);

  // 完封連続日数: 今日から遡って支出ゼロの日が続く日数
  const expenseDates = new Set(
    expenses.filter((e) => e.balanceType === 0 && e.amount > 0).map((e) => e.date)
  );
  let zeroStreakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    if (expenseDates.has(d)) break;
    zeroStreakDays++;
  }

  // 直近30日の日次平均支出B（実績ベース）
  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const recent30 = expenses.filter((e) => e.balanceType === 0 && e.date >= cutoff);
  const recordedDates = new Set(recent30.map((e) => e.date));
  const recordedDays = recordedDates.size;
  const avgDailyExpense =
    recordedDays > 0
      ? recent30.reduce((s, e) => s + e.amount, 0) / recordedDays
      : 0;

  return { todayExpense, yesterdayExpense, zeroStreakDays, avgDailyExpense, recordedDays };
}

async function DashboardContent() {
  let expenses;
  try {
    const data = await getExpenses();
    expenses = data.expense ?? [];
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect("/login");
    }
    throw err;
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value ?? "Guest";

  const { todayExpense, yesterdayExpense, zeroStreakDays, avgDailyExpense, recordedDays } =
    computeXDayInputs(expenses);

  return (
    <>
      <Header userName={userId} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
          {/* 左カラム：Xデーパネル + 今日のレポート + 入力フォーム */}
          <div className="flex flex-col gap-4">
            <XDayDisplay
              todayExpense={todayExpense}
              yesterdayExpense={yesterdayExpense}
              zeroStreakDays={zeroStreakDays}
              avgDailyExpense={avgDailyExpense}
              recordedDays={recordedDays}
            />
            <TodayReport expenses={expenses} />
            <ExpenseCreateForm userId={userId} />
          </div>

          {/* 右カラム：直近のレポートグラフ */}
          <RecentGraph expenses={expenses} />
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
            読み込み中...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
