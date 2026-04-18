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
    <header className="sticky top-0 z-10 border-b border-[#1c1410]/10 bg-[#fffdf5]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#1c1410] bg-[#f18840] text-sm font-extrabold text-white"
            style={{ boxShadow: "var(--shadow-pop-sm)" }}
          >
            B
          </span>
          <span className="text-base font-bold text-[#1c1410]">
            家計簿
          </span>
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
                  "relative px-3 py-2 text-sm font-semibold transition-colors rounded-lg",
                  isActive
                    ? "text-[#f18840] bg-[#fff6ee]"
                    : "text-[#1c1410] hover:text-[#f18840] hover:bg-[#fff6ee]",
                ].join(" ")}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-[#f18840]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ユーザー情報 + ログアウト */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm font-medium text-[#1c1410]/50">
              {userName}さん
            </span>
          )}
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost text-xs px-3 py-1.5">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
