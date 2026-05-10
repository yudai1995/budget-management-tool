import { Skeleton as UiSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const roundedClass = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

export interface SkeletonProps {
  /** 幅。Tailwind クラスまたは inline style で指定。デフォルトは w-full */
  className?: string
  /** 高さ（px）。指定しない場合は className に含めること */
  height?: number
  /** 角丸スタイル */
  rounded?: keyof typeof roundedClass
}

/**
 * コンテンツ読み込み中に表示するプレースホルダー。
 * shadcn/ui Skeleton をベースに height / rounded ショートハンドを追加。
 */
export function Skeleton({ className = '', height, rounded = 'md' }: SkeletonProps) {
  return (
    <UiSkeleton
      className={cn(roundedClass[rounded], className)}
      style={height !== undefined ? { height } : undefined}
      aria-hidden="true"
    />
  )
}

/** DailyBudgetCard のローディングスケルトン */
export function DailyBudgetCardSkeleton() {
  return (
    <div
      className="rounded-2xl border-2 p-5"
      style={{ borderColor: 'var(--border-default)', background: 'var(--color-surface-subtle)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-24" height={12} rounded="full" />
        <Skeleton className="w-10" height={20} rounded="full" />
      </div>
      <Skeleton className="w-36" height={40} rounded="lg" />
      <div className="flex gap-3 mt-4">
        <Skeleton className="w-20" height={12} rounded="full" />
        <Skeleton className="w-20" height={12} rounded="full" />
      </div>
      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <Skeleton className="w-32" height={12} rounded="full" />
      </div>
    </div>
  )
}
