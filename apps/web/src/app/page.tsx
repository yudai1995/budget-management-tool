import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getExpenses } from "@/lib/api/expense";
import { getSettings } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/client";
import { AppShell } from "@/components/layout/AppShell";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";
import { XDayDisplay } from "@/components/dashboard/XDayDisplay";
import { MonthlyOverviewCard } from "@/components/dashboard/MonthlyOverviewCard";
import { RecentExpenseList } from "@/components/dashboard/RecentExpenseList";

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

  // 連続記録日数: 今日から遡って何らかの記録がある日が続く日数
  const allRecordDates = new Set(expenses.map((e) => e.date));
  let recordingStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    if (!allRecordDates.has(d)) break;
    recordingStreak++;
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

  return { todayExpense, yesterdayExpense, zeroStreakDays, avgDailyExpense, recordedDays, recordingStreak };
}

async function DashboardContent({ userId }: { userId: string }) {
  let expenses;
  let settings = { totalAssets: null as number | null, monthlyIncome: 0 };

  try {
    const [expenseData, settingsData] = await Promise.all([getExpenses(), getSettings()]);
    expenses = expenseData.expense ?? [];
    settings = {
      totalAssets: settingsData.totalAssets === 0 && settingsData.monthlyIncome === 0
        ? null  // 未設定扱い（初回セットアップ）
        : settingsData.totalAssets,
      monthlyIncome: settingsData.monthlyIncome,
    };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect("/login");
    }
    // settings の取得に失敗しても expenses は続行できる場合はそのまま
    if (expenses === undefined) throw err;
  }

  const { todayExpense, yesterdayExpense, zeroStreakDays, avgDailyExpense, recordedDays, recordingStreak } =
    computeXDayInputs(expenses);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 bg-[#fffdf5]">
      {/*
        Mobile (default): stacked single column
          1. 今月の収支サマリー（現状把握）
          2. クイック入力（スクロールなしで操作可能）
          3. 家計の寿命（中心指標）
          4. 最近の記録5件

        Desktop (lg): 2-column
          Left: 今月の収支 + 家計の寿命
          Right: クイック入力 + 最近の記録
      */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        {/* 左カラム（desktop）/ 先頭2カード（mobile） */}
        <div className="flex flex-col gap-4">
          <MonthlyOverviewCard expenses={expenses} />
          <div className="lg:block">
            <XDayDisplay
              todayExpense={todayExpense}
              yesterdayExpense={yesterdayExpense}
              zeroStreakDays={zeroStreakDays}
              avgDailyExpense={avgDailyExpense}
              recordedDays={recordedDays}
              recordingStreak={recordingStreak}
              initialAssets={settings.totalAssets}
              initialIncome={settings.monthlyIncome}
            />
          </div>
        </div>

        {/* 右カラム（desktop）/ 後続2カード（mobile） */}
        <div className="flex flex-col gap-4">
          <ExpenseCreateForm userId={userId} />
          <RecentExpenseList expenses={expenses} />
        </div>
      </div>
    </main>
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value ?? "Guest";

  return (
    <AppShell userName={userId}>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-[#1c1410]/40">
            読み込み中...
          </div>
        }
      >
        <DashboardContent userId={userId} />
      </Suspense>
    </AppShell>
  );
}
