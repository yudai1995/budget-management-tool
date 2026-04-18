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
    <div className="flex gap-1.5">
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => select(period)}
          className={[
            "rounded-full px-3 py-1 text-xs font-bold transition-colors border-2",
            current === period
              ? "bg-[#f18840] text-white border-[#1c1410]"
              : "border-[#e8c8b0] bg-white text-[#1c1410]/60 hover:border-[#1c1410] hover:text-[#1c1410]",
          ].join(" ")}
          style={current === period ? { boxShadow: "2px 2px 0px 0px #1c1410" } : undefined}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}
