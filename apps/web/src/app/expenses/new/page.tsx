import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ExpenseCreateForm } from "@/components/expense/ExpenseCreateForm";

export const metadata: Metadata = {
  title: "収支を記録する | 家計管理",
};

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function ExpenseNewPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) redirect("/login");

  const { date } = await searchParams;
  // YYYY-MM-DD 形式以外は無視する
  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-subtle)]">
      <Header userName={userId} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <ExpenseCreateForm userId={userId} defaultDate={defaultDate} />
      </main>
    </div>
  );
}
