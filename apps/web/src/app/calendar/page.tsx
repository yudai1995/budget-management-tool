import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getExpenses } from "@/lib/api/expense";
import { ApiError } from "@/lib/api/client";
import { AppShell } from "@/components/layout/AppShell";
import { TodayReport } from "@/components/report/TodayReport";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";

export const metadata: Metadata = {
  title: "カレンダー | 家計管理",
};

async function CalendarContent({ userId }: { userId: string }) {
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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 bg-[#fffdf5]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
        {/* 左カラム：今日のレポート + 入力フォーム */}
        <div className="flex flex-col gap-4">
          <TodayReport expenses={expenses} />
          <ExpenseCreateForm userId={userId} />
        </div>

        {/* 右カラム：月次カレンダー */}
        <MonthlyCalendar expenses={expenses} />
      </div>
    </main>
  );
}

export default async function CalendarPage() {
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
        <CalendarContent userId={userId} />
      </Suspense>
    </AppShell>
  );
}
