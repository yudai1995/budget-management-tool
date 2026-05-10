import { cn } from '@/lib/utils'

export type BadgeVariant = 'safe' | 'caution' | 'danger' | 'neutral' | 'income' | 'expense'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

/** バリアントごとの Tailwind クラス（Pattern D カラーパレット準拠） */
const variantClass: Record<BadgeVariant, string> = {
  /** 余裕 — ウォームグレー */
  safe: 'bg-[#c4b5a5] text-white border-[#c4b5a5]',
  /** 注意 — コーラル */
  caution: 'bg-[#f87171] text-white border-[#f87171]',
  /** ピンチ — ローズ */
  danger: 'bg-[#f43f5e] text-white border-[#f43f5e]',
  /** 中立 */
  neutral: 'bg-white text-[#1c1410] border-[#1c1410]/30',
  /** 収入 */
  income: 'bg-[#35b5a2] text-white border-[#35b5a2]',
  /** 支出 */
  expense: 'bg-[#f18840] text-white border-[#f18840]',
}

/**
 * ステータス・カテゴリを示す小型バッジ。
 * safe / caution / danger は Pattern D のカラーパレットを使用。
 */
export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold',
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
