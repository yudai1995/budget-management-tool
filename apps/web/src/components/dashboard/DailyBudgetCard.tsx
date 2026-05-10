"use client";

import type { DailyBudgetResult } from "@budget/common";

/** ピンチ度レベル */
type PinchLevel = "safe" | "caution" | "danger";

/**
 * 残予算比率からピンチ度を判定する。
 *
 * remaining = dailyBudget - todayExpense
 * ratio     = remaining / dailyBudget
 *   >= 0.8  → safe    (残予算80%以上 = 余裕)
 *   >= 0.2  → caution (残予算20〜80% = 注意)
 *   < 0.2   → danger  (残予算20%未満 or 予算超過 = ピンチ)
 */
function calcPinchLevel(dailyBudget: number, todayExpense: number): PinchLevel {
  if (dailyBudget <= 0) return "danger";
  const remaining = dailyBudget - todayExpense;
  const ratio = remaining / dailyBudget;
  if (ratio >= 0.8) return "safe";
  if (ratio >= 0.2) return "caution";
  return "danger";
}

/** 金額を ¥X,XXX 形式にフォーマット */
function formatYen(amount: number): string {
  return `¥${Math.abs(amount).toLocaleString("ja-JP")}`;
}

type PinchStyle = {
  bg: string;
  border: string;
  heroColor: string;
  badgeBg: string;
  badgeText: string;
  label: string;
};

const PINCH_STYLES: Record<PinchLevel, PinchStyle> = {
  safe: {
    bg: "var(--color-safe-light)",
    border: "var(--color-safe)",
    heroColor: "var(--color-safe)",
    badgeBg: "var(--color-safe)",
    badgeText: "#ffffff",
    label: "余裕",
  },
  caution: {
    bg: "var(--color-caution-light)",
    border: "var(--color-caution)",
    heroColor: "var(--color-caution)",
    badgeBg: "var(--color-caution)",
    badgeText: "#1c1410",
    label: "注意",
  },
  danger: {
    bg: "var(--color-danger-light)",
    border: "var(--color-danger)",
    heroColor: "var(--color-danger)",
    badgeBg: "var(--color-danger)",
    badgeText: "#ffffff",
    label: "ピンチ",
  },
};

type Props = {
  /** 今日の支出合計（円） */
  todayExpense: number;
  /**
   * calcDailyBudget の結果。設定未完了の場合は null。
   */
  budgetResult: DailyBudgetResult | null;
};

/**
 * 「今日使えるお金」をヒーローナンバーで表示するダッシュボードカード。
 * ピンチ度に応じて信号機カラーで背景色が変わる。
 */
export function DailyBudgetCard({ todayExpense, budgetResult }: Props) {
  // 設定未完了のフォールバック表示
  if (!budgetResult) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed p-5"
        style={{ borderColor: "var(--border-default)", background: "var(--color-surface-subtle)" }}
      >
        <p className="text-sm font-medium text-[#1c1410]/50 text-center">
          設定を完了すると「今日使えるお金」が表示されます
        </p>
      </div>
    );
  }

  const { dailyBudget, daysUntilPayday } = budgetResult;
  const remaining = dailyBudget - todayExpense;
  const isOverBudget = remaining < 0;
  const pinchLevel = calcPinchLevel(dailyBudget, todayExpense);
  const style = PINCH_STYLES[pinchLevel];

  return (
    <div
      className="rounded-2xl border-2 p-5"
      style={{
        background: style.bg,
        borderColor: style.border,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#1c1410]/60 uppercase tracking-wide">
          今日使えるお金
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ background: style.badgeBg, color: style.badgeText }}
        >
          {style.label}
        </span>
      </div>

      {/* ヒーローナンバー */}
      <div className="mb-4">
        <p
          className="text-4xl font-extrabold leading-none"
          style={{ color: isOverBudget ? "var(--color-danger)" : style.heroColor }}
        >
          {isOverBudget ? `-${formatYen(Math.abs(remaining))}` : formatYen(remaining)}
        </p>
        {isOverBudget && (
          <p className="mt-1 text-xs font-medium text-[#1c1410]/60">
            予算を{formatYen(Math.abs(remaining))}超過
          </p>
        )}
      </div>

      {/* 内訳行 */}
      <div className="flex items-center gap-3 text-xs text-[#1c1410]/60">
        <span>
          1日予算{" "}
          <span className="font-bold text-[#1c1410]/80">{formatYen(dailyBudget)}</span>
        </span>
        <span className="text-[#1c1410]/30">|</span>
        <span>
          本日支出{" "}
          <span className="font-bold text-[#1c1410]/80">{formatYen(todayExpense)}</span>
        </span>
      </div>

      {/* 給料日カウントダウン */}
      <div
        className="mt-3 pt-3 border-t flex items-center gap-1.5"
        style={{ borderColor: `${style.border}40` }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: style.heroColor }}
        />
        <span className="text-xs text-[#1c1410]/60">
          給料日まで{" "}
          <span className="font-bold text-[#1c1410]/80">あと{daysUntilPayday}日</span>
        </span>
      </div>
    </div>
  );
}
