"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "ホーム", href: "/" },
  { label: "カレンダー", href: "/calendar" },
  { label: "レポート", href: "/report" },
  { label: "記録する", href: "/expenses/new" },
];

type Props = {
  userName?: string;
};

export function Header({ userName }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-brand-primary)]/20 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-zinc-800"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-brand-primary)] text-xs font-bold text-white">
            B
          </span>
          家計簿管理ツール
        </Link>

        {/* ナビゲーション */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative px-4 py-4 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[var(--color-brand-primary)]"
                    : "text-zinc-600 hover:text-[var(--color-brand-primary)]",
                ].join(" ")}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-brand-primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ユーザー情報 + ログアウト */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-zinc-600">{userName}さん</span>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
