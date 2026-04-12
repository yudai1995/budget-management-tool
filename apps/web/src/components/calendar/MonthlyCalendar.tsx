"use client";

import { useState } from "react";
import type { ExpenseResponse } from "@/lib/api/types";
import { useRouter } from "next/navigation";

type Props = {
  expenses: ExpenseResponse[];
};

type DayData = {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  outgo: number;
  income: number;
};

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function buildCalendarDays(year: number, month: number, expenses: ExpenseResponse[]): DayData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 前月の日付でカレンダーの先頭を埋める
  const startPad = firstDay.getDay();
  const days: DayData[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({
      date: d,
      dateStr: d.toISOString().split("T")[0],
      isCurrentMonth: false,
      isToday: false,
      outgo: 0,
      income: 0,
    });
  }

  // 当月の日付
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split("T")[0];
    const dayExpenses = expenses.filter((e) => e.date === dateStr);
    const outgo = dayExpenses
      .filter((e) => e.balanceType === 0)
      .reduce((s, e) => s + e.amount, 0);
    const income = dayExpenses
      .filter((e) => e.balanceType === 1)
      .reduce((s, e) => s + e.amount, 0);

    days.push({
      date: d,
      dateStr,
      isCurrentMonth: true,
      isToday: d.getTime() === today.getTime(),
      outgo,
      income,
    });
  }

  // 次月の日付でカレンダーの末尾を埋める（6行になるよう）
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      dateStr: d.toISOString().split("T")[0],
      isCurrentMonth: false,
      isToday: false,
      outgo: 0,
      income: 0,
    });
  }

  return days;
}

export function MonthlyCalendar({ expenses }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const router = useRouter();

  const days = buildCalendarDays(year, month, expenses);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: DayData) => {
    if (!day.isCurrentMonth) return;
    // クリックした日付をクエリパラメータで渡してフォームへ
    router.push(`/?date=${day.dateStr}#form`);
  };

  return (
    <section className="flex h-full flex-col rounded-xl border border-zinc-100 bg-white shadow-sm">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between rounded-t-xl bg-[var(--color-brand-primary)] px-4 py-3 text-white">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20"
          aria-label="前月"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold">
          {year}年{month + 1}月1日 – {new Date(year, month + 1, 0).getDate()}日
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20"
          aria-label="翌月"
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {WEEK_DAYS.map((day, i) => (
          <div
            key={day}
            className={[
              "py-2 text-center text-xs font-medium",
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-zinc-500",
            ].join(" ")}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((day, idx) => (
          <button
            key={day.dateStr + (day.isCurrentMonth ? "" : `-pad${idx}`)}
            type="button"
            onClick={() => handleDayClick(day)}
            disabled={!day.isCurrentMonth}
            className={[
              "relative flex flex-col items-start border-b border-r border-zinc-100 p-1 text-left text-xs transition-colors",
              day.isCurrentMonth
                ? "hover:bg-[var(--color-surface-subtle)] cursor-pointer"
                : "cursor-default",
              day.isToday ? "bg-amber-50" : "",
            ].join(" ")}
          >
            {/* 日付数字 */}
            <span
              className={[
                "mb-0.5 text-xs",
                !day.isCurrentMonth ? "text-zinc-300" : day.isToday ? "font-bold text-[var(--color-brand-primary)]" : "text-zinc-600",
              ].join(" ")}
            >
              {day.date.getDate()}日
            </span>

            {/* 支出 */}
            {day.outgo > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-expense)] text-[8px]">
                </span>
                <span className="text-[10px] text-zinc-700">
                  {day.outgo >= 1000
                    ? `${Math.floor(day.outgo / 1000)}k`
                    : day.outgo}
                </span>
              </div>
            )}

            {/* 収入 */}
            {day.income > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-income)] text-[8px]">
                </span>
                <span className="text-[10px] text-zinc-700">
                  {day.income >= 1000
                    ? `${Math.floor(day.income / 1000)}k`
                    : day.income}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
