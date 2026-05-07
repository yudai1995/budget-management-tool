"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "./navItems";
import type { NavItem } from "./navItems";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // ナビ項目を中央のFABで2つに分割
  const leftItems = NAV_ITEMS.slice(0, 2);
  const rightItems = NAV_ITEMS.slice(2);

  function handleFabSelect(type: "expense" | "income") {
    setFabOpen(false);
    router.push(`/expenses/new?type=${type}`);
  }

  return (
    <>
      {/* FAB展開時のオーバーレイ */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#1c1410]/50"
          onClick={() => setFabOpen(false)}
        >
          {/* 選択メニュー */}
          <div
            className="absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handleFabSelect("income")}
              className="rounded-2xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
              style={{ background: "var(--color-income, #4caf82)" }}
            >
              収入を記録
            </button>
            <button
              type="button"
              onClick={() => handleFabSelect("expense")}
              className="rounded-2xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
              style={{ background: "var(--color-expense, #e05c5c)" }}
            >
              支出を記録
            </button>
          </div>
        </div>
      )}

      {/* ボトムナビゲーションバー（モバイルのみ表示） */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-[#1c1410]/10 bg-white md:hidden"
        style={{ height: 64, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="モバイルナビゲーション"
      >
        {/* 左2項目 */}
        {leftItems.map((item) => (
          <BottomNavItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
          />
        ))}

        {/* 中央FABボタン */}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            aria-label={fabOpen ? "メニューを閉じる" : "記録する"}
            aria-expanded={fabOpen}
            onClick={() => setFabOpen(!fabOpen)}
            className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
            style={{
              background: "var(--color-brand-primary, #f08030)",
              boxShadow: "0 4px 16px rgba(240,128,48,0.4)",
            }}
          >
            {fabOpen ? (
              <X size={22} className="text-white" />
            ) : (
              <Plus size={22} className="text-white" />
            )}
          </button>
        </div>

        {/* 右2項目 */}
        {rightItems.map((item) => (
          <BottomNavItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
          />
        ))}
      </nav>
    </>
  );
}

function BottomNavItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
      style={{ color: active ? "var(--color-brand-primary, #f08030)" : "rgba(28,20,16,0.4)" }}
    >
      <Icon size={22} />
      <span className="text-[10px] font-semibold">{item.label}</span>
    </Link>
  );
}
