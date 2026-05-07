import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";

export const metadata: Metadata = {
  title: "収支を記録する | 家計管理",
};

type Props = {
  searchParams: Promise<{ date?: string; type?: string }>;
};

export default async function ExpenseNewPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) redirect("/login");

  const { date, type } = await searchParams;
  // YYYY-MM-DD 形式以外は無視する
  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  // "income" のみ収入タブを初期選択、それ以外は支出（デフォルト）
  const defaultBalanceType: 0 | 1 = type === "income" ? 1 : 0;

  return (
    <AppShell userName={userId}>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <ExpenseCreateForm
          userId={userId}
          defaultDate={defaultDate}
          defaultBalanceType={defaultBalanceType}
        />
      </main>
    </AppShell>
  );
}
