"use client";

import { useState } from "react";

type ExportFormat = "json" | "csv";

export function DataExportSection() {
    const [format, setFormat] = useState<ExportFormat>("json");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExport() {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/export/expenses?format=${format}`, {
                headers: { Accept: format === "csv" ? "text/csv" : "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({ message: "エクスポートに失敗しました" }));
                throw new Error((body as { message?: string }).message ?? "エクスポートに失敗しました");
            }

            const blob = await res.blob();
            const contentDisposition = res.headers.get("Content-Disposition") ?? "";
            const match = contentDisposition.match(/filename="(.+?)"/);
            const filename = match?.[1] ?? `expenses.${format}`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エクスポートに失敗しました");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div
            className="rounded-2xl border-2 border-[#1c1410] bg-white p-6 space-y-4"
            style={{ boxShadow: "var(--shadow-pop)" }}
        >
            <div>
                <h2 className="text-base font-extrabold text-[#1c1410]">
                    全データのバックアップ
                </h2>
                <p className="mt-1 text-sm font-medium text-[#1c1410]/60">
                    いつでもデータを持ち出し可能です。サービスへの依存を気にせずご利用いただけます。
                </p>
            </div>

            {/* フォーマット選択 */}
            <div className="flex gap-3">
                {(["json", "csv"] as ExportFormat[]).map((f) => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="exportFormat"
                            value={f}
                            checked={format === f}
                            onChange={() => setFormat(f)}
                            className="accent-[#f18840]"
                        />
                        <span className="text-sm font-bold text-[#1c1410] uppercase font-mono">{f}</span>
                    </label>
                ))}
            </div>

            <div className="rounded-xl border border-[#e8c8b0] bg-[#fffdf5] px-3 py-2 text-xs font-medium text-[#1c1410]/60">
                {format === "json" && <p>JSON 形式: 構造化データ。他ツールへのインポートやプログラムでの加工に最適</p>}
                {format === "csv" && <p>CSV 形式: Excel / Google スプレッドシートで直接開けます</p>}
            </div>

            {error && (
                <p className="rounded-xl border border-[#f87171]/40 bg-[#fee2e2] px-3 py-2 text-sm font-medium text-[#1c1410]">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleExport}
                disabled={isLoading}
                className="btn-candy disabled:opacity-50"
            >
                {isLoading ? "準備中..." : `${format.toUpperCase()} でダウンロード`}
            </button>
        </div>
    );
}
