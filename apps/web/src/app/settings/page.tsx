import type { Metadata } from "next";
import { DataExportSection } from "@/components/settings/DataExportSection";

export const metadata: Metadata = { title: "設定 | 家計管理ツール" };

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12">
            <div className="mx-auto max-w-xl px-4 space-y-6">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">設定</h1>
                <DataExportSection />
            </div>
        </div>
    );
}
