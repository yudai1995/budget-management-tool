"use client";

import type { ReactNode } from "react";

interface Props {
    content: ReactNode;
    children: ReactNode;
}

/**
 * ホバーで表示されるシンプルなツールチップ。
 * Tailwind の group / group-hover で実装（外部ライブラリ不要）。
 */
export function Tooltip({ content, children }: Props) {
    return (
        <span className="group relative inline-flex">
            {children}
            <span
                role="tooltip"
                className={[
                    "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2",
                    "rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-600 shadow-lg",
                    "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                    "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                ].join(" ")}
            >
                {/* 吹き出しの三角 */}
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-200 dark:border-t-zinc-700" />
                {content}
            </span>
        </span>
    );
}
