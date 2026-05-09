import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = { title: "はじめる | 家計管理" };

export default async function OnboardingPage() {
    const cookieStore = await cookies();
    // すでにオンボーディング済みのユーザーはホームへ
    if (cookieStore.get("onboarding_completed")) {
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
            <OnboardingWizard />
        </div>
    );
}
