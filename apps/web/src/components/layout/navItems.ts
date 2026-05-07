import { Home, Calendar, BarChart2, Settings } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/** PC サイドバー・モバイルボトムナビ共通のナビゲーション定義 */
export const NAV_ITEMS: NavItem[] = [
  { label: "ホーム",       href: "/",         icon: Home },
  { label: "カレンダー",   href: "/calendar",  icon: Calendar },
  { label: "レポート",     href: "/report",    icon: BarChart2 },
  { label: "設定",         href: "/settings",  icon: Settings },
];
