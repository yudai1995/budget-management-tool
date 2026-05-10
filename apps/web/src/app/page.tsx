import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { calcDailyBudget } from "@budget/common";
import { getExpenses } from "@/lib/api/expense";
import { getSettings } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/client";
import { AppShell } from "@/components/layout/AppShell";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";
import { XDayDisplay } from "@/components/dashboard/XDayDisplay";
import { MonthlyOverviewCard } from "@/components/dashboard/MonthlyOverviewCard";
import { RecentExpenseList } from "@/components/dashboard/RecentExpenseList";
import { DailyBudgetCard } from "@/components/dashboard/DailyBudgetCard";

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
  const [expensesResult, settingsResult] = await Promise.allSettled([
    getExpenses(),
    getSettings(),
  ]);

  // 認証エラーはログインページにリダイレクト
  for (const result of [expensesResult, settingsResult]) {
    if (result.status === "rejected" && result.reason instanceof ApiError) {
      if (result.reason.status === 401 || result.reason.status === 403) {
        redirect("/login");
      }
    }
  }

  // 支出取得失敗はクラッシュ（認証エラー以外）
  if (expensesResult.status === "rejected") throw expensesResult.reason;

  const expenses = expensesResult.value.expense ?? [];

  // 設定取得失敗はデフォルト値で続行（マイグレーション未適用等でもホーム画面を表示する）
  const settingsData = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const isSettingsConfigured =
    settingsData !== null &&
    !(settingsData.totalAssets === 0 && settingsData.monthlyIncome === 0);
  const settings = {
    totalAssets: isSettingsConfigured ? settingsData.totalAssets : null,
    monthlyIncome: settingsData?.monthlyIncome ?? 0,
    paydayDay: settingsData?.paydayDay ?? 25,
    fixedExpenses: settingsData?.fixedExpenses ?? 0,
  };

  const { todayExpense, yesterdayExpense, zeroStreakDays, avgDailyExpense, recordedDays, recordingStreak } =
    computeXDayInputs(expenses);

  // 1日予算を算出（設定が揃っている場合のみ）
  const dailyBudgetResult =
    settings.totalAssets !== null
      ? calcDailyBudget({
          totalAssets: settings.totalAssets,
          fixedExpenses: settings.fixedExpenses,
          paydayDay: settings.paydayDay,
          today: new Date(),
        })
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 bg-[#fffdf5]">
      {/*
        Mobile (default): stacked single column
          1. 今日使えるお金（主要指標 → 行動変容の即時フィードバック）
          2. 今月の収支サマリー（現状把握）
          3. クイック入力（スクロールなしで操作可能）
          4. 家計の寿命（補助指標 → 段階的廃止予定）
          5. 最近の記録5件

        Desktop (lg): 2-column
          Left: 今日使えるお金 + 今月の収支 + 家計の寿命
          Right: クイック入力 + 最近の記録
      */}
      {/* 今日使えるお金: 全幅で最上位に配置 */}
      <div className="mb-4">
        <DailyBudgetCard todayExpense={todayExpense} budgetResult={dailyBudgetResult} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        {/* 左カラム（desktop）/ 先頭カード（mobile） */}
        <div className="flex flex-col gap-4">
          <MonthlyOverviewCard expenses={expenses} />
          {/* 家計の寿命: 段階的廃止フェーズ1 — 表示は維持するが priority を下げる */}
          <div className="lg:block opacity-80">
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

        {/* 右カラム（desktop）/ 後続カード（mobile） */}
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
