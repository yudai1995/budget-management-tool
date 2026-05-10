export type BadgeVariant =
  | "safe"
  | "caution"
  | "danger"
  | "neutral"
  | "income"
  | "expense"

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  /** 余裕 — ウォームグレー（Pattern D） */
  safe: {
    bg: "#c4b5a5",
    color: "#ffffff",
    border: "#c4b5a5",
  },
  /** 注意 — コーラル（Pattern D） */
  caution: {
    bg: "#f87171",
    color: "#ffffff",
    border: "#f87171",
  },
  /** ピンチ — ローズ（Pattern D） */
  danger: {
    bg: "#f43f5e",
    color: "#ffffff",
    border: "#f43f5e",
  },
  /** 中立 */
  neutral: {
    bg: "#ffffff",
    color: "#1c1410",
    border: "#1c1410",
  },
  /** 収入 */
  income: {
    bg: "#35b5a2",
    color: "#ffffff",
    border: "#35b5a2",
  },
  /** 支出 */
  expense: {
    bg: "#f18840",
    color: "#ffffff",
    border: "#f18840",
  },
}

/**
 * ステータス・カテゴリを示す小型バッジ。
 * safe / caution / danger は Pattern D のカラーパレットを使用。
 */
export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  const s = variantStyles[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${className}`}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  )
}
