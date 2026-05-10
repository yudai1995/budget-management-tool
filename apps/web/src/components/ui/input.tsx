import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

/**
 * shadcn/ui パターンの Input。
 * フォーカス時にブランドオレンジのリングを表示する。
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-xl border-2 border-[#1c1410]/20 bg-white px-4 py-2.5 text-sm text-[#1c1410] placeholder:text-[#1c1410]/40',
          'min-h-[44px]',
          'transition-colors',
          'focus:outline-none focus:border-[#f18840] focus:ring-2 focus:ring-[#f18840]/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
