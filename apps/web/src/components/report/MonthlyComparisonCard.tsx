import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { MonthlyComparisonData } from "@budget/common";

interface Props {
    data: MonthlyComparisonData;
}

/** 増減の向き・色・アイコンを返す */
function getDiffProps(diff: number, pct: number | null) {
    if (diff === 0 || pct === 0) {
        return {
            icon: <Minus size={14} />,
            color: "var(--color-income)",
            label: "増減なし",
            sign: "",
        };
    }
    if (diff > 0) {
        return {
            icon: <TrendingUp size={14} />,
            color: "var(--color-expense)",
            label: `+¥${diff.toLocaleString()}${pct !== null ? ` (+${pct}%)` : ""}`,
            sign: "+",
        };
    }
    return {
        icon: <TrendingDown size={14} />,
        color: "var(--color-income)",
        label: `-¥${Math.abs(diff).toLocaleString()}${pct !== null ? ` (${pct}%)` : ""}`,
        sign: "-",
    };
}

export function MonthlyComparisonCard({ data }: Props) {
    const prevMonth = getDiffProps(data.prevMonthDiff, data.prevMonthPct);
    const prevYear = data.prevYearTotal !== null
        ? getDiffProps(data.prevYearDiff!, data.prevYearPct)
        : null;

    return (
        <section>
            <h2 className="mb-3 text-sm font-extrabold text-[#1c1410]">
                前月比・前年同月比
            </h2>
            <div
                className="flex flex-col gap-3 rounded-2xl border border-[#1c1410]/12 bg-white p-4"
                style={{ boxShadow: "var(--shadow-card)" }}
            >
                {/* 前月比 */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#1c1410]/50">前月比</p>
                        <p className="mt-0.5 text-xs font-medium text-[#1c1410]/40">
                            前月: ¥{data.prevMonthTotal.toLocaleString()}
                        </p>
                    </div>
                    <div
                        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold"
                        style={{ color: prevMonth.color, backgroundColor: `color-mix(in srgb, ${prevMonth.color} 10%, transparent)` }}
                    >
                        {prevMonth.icon}
                        <span>{prevMonth.label}</span>
                    </div>
                </div>

                {/* 前年同月比（データがある場合のみ） */}
                {prevYear !== null && (
                    <div className="flex items-center justify-between border-t border-[#e8c8b0] pt-3">
                        <div>
                            <p className="text-xs font-bold text-[#1c1410]/50">前年同月比</p>
                            <p className="mt-0.5 text-xs font-medium text-[#1c1410]/40">
                                前年同月: ¥{data.prevYearTotal!.toLocaleString()}
                            </p>
                        </div>
                        <div
                            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold"
                            style={{ color: prevYear.color, backgroundColor: `color-mix(in srgb, ${prevYear.color} 10%, transparent)` }}
                        >
                            {prevYear.icon}
                            <span>{prevYear.label}</span>
                        </div>
                    </div>
                )}

                {/* 前年データなし */}
                {prevYear === null && (
                    <p className="border-t border-[#e8c8b0] pt-3 text-xs font-medium text-[#1c1410]/30">
                        前年同月のデータがありません
                    </p>
                )}
            </div>
        </section>
    );
}
