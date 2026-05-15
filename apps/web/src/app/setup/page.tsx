import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { InitialSetupWizard } from "@/components/setup/InitialSetupWizard";

export const metadata: Metadata = { title: "初回設定 | 家計管理" };

export default async function SetupPage() {
    const cookieStore = await cookies();
    // すでに初回設定済みのユーザーはホームへ
    if (cookieStore.get("setup_completed")) {
        redirect("/");
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "var(--color-surface-default)" }}
        >
            {/* CSS アニメーション定義（keyframes はグローバルスコープに汚染しないようインライン定義） */}
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
            <InitialSetupWizard />
        </div>
    );
}
