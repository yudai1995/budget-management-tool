'use client'

import { Button as UiButton, type ButtonProps as UiButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type { ButtonVariant, ButtonSize } from '@/components/ui/button'

export interface ButtonProps extends UiButtonProps {
  /** 幅いっぱいに広げる */
  fullWidth?: boolean
}

/**
 * プロジェクト共通ボタンコンポーネント。
 * shadcn/ui の Button (cva + Radix Slot) をベースに fullWidth を追加。
 */
export function Button({ fullWidth, className, ...props }: ButtonProps) {
  return (
    <UiButton
      className={cn(fullWidth && 'w-full', className)}
      {...props}
    />
  )
}

Button.displayName = 'Button'
