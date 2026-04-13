import { ShieldCheck, UserRound } from "lucide-react";
import { Tooltip } from "./Tooltip";

/**
 * ログイン・登録フォームに添える控えめなセキュリティバッジ。
 * クリック不要のツールチップでセキュリティ宣言を伝える。
 */
export function SecurityBadges() {
    return (
        <div className="flex gap-2">
            <Tooltip
                content={
                    <span className="space-y-1 block">
                        <strong className="font-medium text-zinc-800 dark:text-zinc-100">
                            データ保護について
                        </strong>
                        <p className="leading-relaxed">
                            入力内容は暗号化されサーバーに安全に保存されます。ローカルストレージのみの保存ではありません。
                        </p>
                    </span>
                }
            >
                <span className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                    <ShieldCheck size={12} strokeWidth={2} className="text-zinc-400 dark:text-zinc-500" />
                    暗号化通信
                </span>
            </Tooltip>

            <Tooltip
                content={
                    <span className="space-y-1 block">
                        <strong className="font-medium text-zinc-800 dark:text-zinc-100">
                            プライバシー配慮
                        </strong>
                        <p className="leading-relaxed">
                            メールアドレスは不要です。匿名のままご利用いただけます。
                        </p>
                    </span>
                }
            >
                <span className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                    <UserRound size={12} strokeWidth={2} className="text-zinc-400 dark:text-zinc-500" />
                    匿名利用可
                </span>
            </Tooltip>
        </div>
    );
}
