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

export const metadata: Metadata = {
  title: "ホーム | 家計管理",
};

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

  return (
    <>
      <Header userName={userId} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
          {/* 左カラム：今日のレポート + 入力フォーム */}
          <div className="flex flex-col gap-4">
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
