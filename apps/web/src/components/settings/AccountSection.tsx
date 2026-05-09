import { logoutAction } from "@/lib/actions/auth";
import { User, LogOut } from "lucide-react";

type Props = {
    userName: string;
};

export function AccountSection({ userName }: Props) {
    return (
        <div
            className="rounded-2xl border-2 border-[#1c1410] bg-white p-6 space-y-4"
            style={{ boxShadow: "var(--shadow-pop)" }}
        >
            <h2 className="text-base font-extrabold text-[#1c1410]">アカウント</h2>
            <div className="flex items-center gap-3">
                <User size={18} className="text-[#1c1410]/40" aria-hidden="true" />
                <span className="text-sm font-bold text-[#1c1410]">{userName}</span>
            </div>
            <form action={logoutAction}>
                <button type="submit" className="btn-ghost">
                    <LogOut size={16} aria-hidden="true" />
                    ログアウト
                </button>
            </form>
        </div>
    );
}
