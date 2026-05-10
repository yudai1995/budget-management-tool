import { cn } from '@/lib/utils'

const sizeClass = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const

export interface LoadingSpinnerProps {
  size?: keyof typeof sizeClass
  className?: string
  /** スクリーンリーダー向けラベル */
  label?: string
}

/**
 * ローディングインジケーター。
 * border-t-transparent でスピナー形状を実現するシンプルな実装。
 */
export function LoadingSpinner({ size = 'md', className, label = '読み込み中' }: LoadingSpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex items-center justify-center', className)}>
      <span
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent',
          sizeClass[size],
        )}
        aria-hidden="true"
      />
    </span>
  )
}
