import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getExpenditureAnalysis } from "@/lib/api/xday";
import { ExpenditureAnalysis } from "@/components/analysis/ExpenditureAnalysis";

export const metadata: Metadata = {
    title: "EXPENDITURE ANALYSIS | 支出解剖",
};

async function AnalysisContent() {
    let data;
    try {
        // netDailyExpense が不明な場合は 0 でフォールバック（統計比較は有効）
        data = await getExpenditureAnalysis(0);
    } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            redirect("/login");
        }
        throw err;
    }

    return <ExpenditureAnalysis data={data} />;
}

export default function AnalysisPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="flex min-h-screen items-center justify-center bg-black text-xs text-[#666666]"
                    style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
                >
                    LOADING...
                </div>
            }
        >
            <AnalysisContent />
        </Suspense>
    );
}
