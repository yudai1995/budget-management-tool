"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white bg-[#f18840] border-2 border-[#1c1410] cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm bg-white border border-[#1c1410]/25 text-[#1c1410] cursor-pointer select-none hover:bg-[#fff6ee] hover:border-[#1c1410]/40 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-[#1c1410]/70 bg-transparent cursor-pointer select-none hover:bg-[#1c1410]/05 disabled:opacity-50 disabled:cursor-not-allowed",
  destructive:
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white bg-[#f43f5e] border-2 border-[#1c1410] cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs min-h-[36px]",
  md: "px-5 py-2.5 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[52px]",
}

const variantShadow: Partial<Record<ButtonVariant, React.CSSProperties>> = {
  primary: { boxShadow: "var(--shadow-pop)" },
  destructive: { boxShadow: "var(--shadow-pop)" },
}

/**
 * プロジェクト共通ボタンコンポーネント。
 * variant で primary / secondary / ghost / destructive を切り替え。
 * タッチターゲット最小 44px を保証（size="sm" は 36px）。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ ...variantShadow[variant], ...style }}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>処理中...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = "Button"
