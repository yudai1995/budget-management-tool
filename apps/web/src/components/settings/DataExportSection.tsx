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
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
            <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    全データのバックアップ
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
                            className="accent-zinc-800 dark:accent-zinc-200"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 uppercase font-mono">{f}</span>
                    </label>
                ))}
            </div>

            <div className="text-xs text-zinc-400 dark:text-zinc-500 space-y-0.5">
                {format === "json" && <p>JSON 形式: 構造化データ。他ツールへのインポートやプログラムでの加工に最適</p>}
                {format === "csv" && <p>CSV 形式: Excel / Google スプレッドシートで直接開けます</p>}
            </div>

            {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleExport}
                disabled={isLoading}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
                {isLoading ? "準備中..." : `${format.toUpperCase()} でダウンロード`}
            </button>
        </div>
    );
}
