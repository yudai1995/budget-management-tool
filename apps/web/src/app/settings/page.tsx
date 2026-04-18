import type { Metadata } from "next";
import { DataExportSection } from "@/components/settings/DataExportSection";
import { Header } from "@/components/layout/Header";
import { cookies } from "next/headers";

export const metadata: Metadata = { title: "設定 | 家計管理" };

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value ?? "Guest";

    return (
        <div className="flex min-h-screen flex-col bg-[#fffdf5]">
            <Header userName={userId} />
            <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
                <h1 className="mb-6 text-2xl font-extrabold text-[#1c1410]">設定</h1>
                <DataExportSection />
            </main>
        </div>
    );
}
