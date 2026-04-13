"use client";

import { useMemo } from "react";
import zxcvbn from "zxcvbn";

interface Props {
    password: string;
}

const LEVELS = [
    { label: "脆弱", color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
    { label: "弱い", color: "bg-orange-400", textColor: "text-orange-600 dark:text-orange-400" },
    { label: "普通", color: "bg-yellow-400", textColor: "text-yellow-600 dark:text-yellow-400" },
    { label: "強い", color: "bg-lime-500", textColor: "text-lime-600 dark:text-lime-400" },
    { label: "非常に安全", color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
] as const;

export function PasswordStrengthMeter({ password }: Props) {
    const result = useMemo(() => {
        if (!password) return null;
        return zxcvbn(password);
    }, [password]);

    if (!password) return null;

    const score = result?.score ?? 0;
    const level = LEVELS[score];

    return (
        <div className="mt-2 space-y-1">
            {/* バー4本 */}
            <div className="flex gap-1">
                {LEVELS.slice(0, 4).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < score
                                ? level.color
                                : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${level.textColor}`}>
                パスワード強度: {level.label}
            </p>
            {result?.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {result.feedback.suggestions[0]}
                </p>
            )}
        </div>
    );
}
