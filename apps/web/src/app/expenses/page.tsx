import { Suspense } from "react";
import type { Metadata } from "next";
import { getExpenses } from "@/lib/api/expense";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";
import { logoutAction } from "@/lib/actions/auth";
import { ApiError } from "@/lib/api/client";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "支出一覧 | 家計管理",
};

async function ExpenseListSection() {
  let data;
  try {
    data = await getExpenses();
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      redirect("/login");
    }
    throw err;
  }

  const expenses = data.expense ?? [];
  const totalOutgo = expenses
    .filter((e) => e.balanceType === 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses
    .filter((e) => e.balanceType === 1)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* サマリー */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">支出合計</p>
          <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
            ¥{totalOutgo.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">収入合計</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            ¥{totalIncome.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 支出リスト */}
      <div className="rounded-xl border border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-800">
        <ExpenseList expenses={expenses} />
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  // TODO: セッションからuserIdを取得する（現在はゲストIDをプレースホルダーとして使用）
  const userId = "Guest";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          家計管理
        </h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            ログアウト
          </button>
        </form>
      </header>

      {/* 新規登録フォーム */}
      <ExpenseCreateForm userId={userId} />

      {/* 支出一覧（Server Component + Suspense でストリーミング） */}
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-zinc-400">
            読み込み中...
          </div>
        }
      >
        <ExpenseListSection />
      </Suspense>
    </div>
  );
}
