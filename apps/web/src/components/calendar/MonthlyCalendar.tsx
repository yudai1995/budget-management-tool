"use client";

import { useState } from "react";
import type { ExpenseResponse } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    router.push(`/expenses/new?date=${day.dateStr}`);
  };

  return (
    <section
      className="flex h-full flex-col rounded-2xl border-2 border-[#1c1410] bg-white overflow-hidden"
      style={{ boxShadow: "var(--shadow-pop)" }}
    >
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between border-b-2 border-[#1c1410] bg-[#f18840] px-4 py-3 text-white">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="前月"
        >
          <ChevronLeft size={14} />
        </button>
        <h2 className="text-sm font-extrabold">
          {year}年{month + 1}月
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="翌月"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-[#e8c8b0] bg-[#fffdf5]">
        {WEEK_DAYS.map((day, i) => (
          <div
            key={day}
            className={[
              "py-2 text-center text-xs font-extrabold",
              i === 0 ? "text-[#f87171]" : i === 6 ? "text-[#35b5a2]" : "text-[#1c1410]/50",
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
              "relative flex flex-col items-start border-b border-r border-[#e8c8b0] p-1 text-left text-xs transition-colors",
              day.isCurrentMonth
                ? "hover:bg-[#fff6ee] cursor-pointer"
                : "cursor-default",
              day.isToday ? "bg-[#fff5ec]" : "",
            ].join(" ")}
          >
            {/* 日付数字 */}
            <span
              className={[
                "mb-0.5 text-xs font-bold",
                !day.isCurrentMonth
                  ? "text-[#1c1410]/20"
                  : day.isToday
                  ? "rounded-full bg-[#f18840] px-1 text-white"
                  : "text-[#1c1410]",
              ].join(" ")}
            >
              {day.date.getDate()}
            </span>

            {/* 支出 */}
            {day.outgo > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f18840]" />
                <span className="text-[9px] font-bold text-[#1c1410]/60">
                  {day.outgo >= 1000
                    ? `${Math.floor(day.outgo / 1000)}k`
                    : day.outgo}
                </span>
              </div>
            )}

            {/* 収入 */}
            {day.income > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#35b5a2]" />
                <span className="text-[9px] font-bold text-[#1c1410]/60">
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
