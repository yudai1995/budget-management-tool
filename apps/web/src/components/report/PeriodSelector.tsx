"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Period = "7days" | "current-month" | "last-month";

const PERIOD_LABELS: Record<Period, string> = {
  "7days": "直近7日",
  "current-month": "今月",
  "last-month": "先月",
};

const PERIODS = Object.keys(PERIOD_LABELS) as Period[];

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") ?? "7days") as Period;

  function select(period: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`/report?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => select(period)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            current === period
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}
