"use client"

import type { DailyBudgetResult } from "@budget/common"

/** ピンチ度レベル */
type PinchLevel = "safe" | "caution" | "danger"

/**
 * 残予算比率からピンチ度を判定する。
 * safe:    残予算 >= 80%（余裕）
 * caution: 残予算 20〜80%（注意）
 * danger:  残予算 < 20% / 超過（ピンチ）
 */
function calcPinchLevel(dailyBudget: number, todayExpense: number): PinchLevel {
  if (dailyBudget <= 0) return "danger"
  const ratio = (dailyBudget - todayExpense) / dailyBudget
  if (ratio >= 0.8) return "safe"
  if (ratio >= 0.2) return "caution"
  return "danger"
}

function formatYen(amount: number): string {
  return `¥${Math.abs(amount).toLocaleString("ja-JP")}`
}

/**
 * Pattern D カラーパレット
 *   SAFE    — ウォームグレー（通常色に近い。余裕時は目立たない）
 *   CAUTION — コーラル #f87171（「注意」感を出しつつオレンジ・黄とは別ヒュー）
 *   DANGER  — ローズ #f43f5e（より濃くエスカレートし「ピンチ」を表現）
 */
const PINCH_STYLES = {
  safe: {
    bg: "#fafaf8",
    border: "#c4b5a5",
    heroColor: "#6b5b52",
    badgeBg: "#c4b5a5",
    badgeText: "#ffffff",
    label: "余裕",
  },
  caution: {
    bg: "#fef2f2",
    border: "#f87171",
    heroColor: "#b91c1c",
    badgeBg: "#f87171",
    badgeText: "#ffffff",
    label: "注意",
  },
  danger: {
    bg: "#fff1f2",
    border: "#f43f5e",
    heroColor: "#9f1239",
    badgeBg: "#f43f5e",
    badgeText: "#ffffff",
    label: "ピンチ",
  },
} satisfies Record<PinchLevel, {
  bg: string
  border: string
  heroColor: string
  badgeBg: string
  badgeText: string
  label: string
}>

type Props = {
  /** 今日の支出合計（円） */
  todayExpense: number
  /** calcDailyBudget の結果。設定未完了の場合は null */
  budgetResult: DailyBudgetResult | null
}

/**
 * 「今日使えるお金」ダッシュボードカード — Pattern D パレット版（#247 実装候補）。
 *
 * 既存の DailyBudgetCard との差分:
 * - ブランドオレンジと競合しない SAFE/CAUTION/DANGER 配色を採用
 * - SAFE はウォームグレー（余裕時は控えめに）
 * - CAUTION はコーラル（#f87171）
 * - DANGER はローズ（#f43f5e）で「ピンチ感」を強調
 *
 * ※ このコンポーネントはカタログ確認用。本番への組み込みはレビュー後に行う。
 */
export function DailyBudgetCardV2({ todayExpense, budgetResult }: Props) {
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
    )
  }

  const { dailyBudget, daysUntilPayday } = budgetResult
  const remaining = dailyBudget - todayExpense
  const isOverBudget = remaining < 0
  const pinchLevel = calcPinchLevel(dailyBudget, todayExpense)
  const s = PINCH_STYLES[pinchLevel]

  return (
    <div
      className="rounded-2xl border-2 p-5"
      style={{
        background: s.bg,
        borderColor: s.border,
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
          style={{ background: s.badgeBg, color: s.badgeText }}
        >
          {s.label}
        </span>
      </div>

      {/* ヒーローナンバー */}
      <div className="mb-4">
        <p
          className="text-4xl font-extrabold leading-none"
          style={{ color: isOverBudget ? PINCH_STYLES.danger.heroColor : s.heroColor }}
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
        style={{ borderColor: `${s.border}40` }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: s.heroColor }}
        />
        <span className="text-xs text-[#1c1410]/60">
          給料日まで{" "}
          <span className="font-bold text-[#1c1410]/80">あと{daysUntilPayday}日</span>
        </span>
      </div>
    </div>
  )
}
