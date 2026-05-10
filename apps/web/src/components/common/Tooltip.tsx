'use client'

import type { ReactNode } from 'react'
import {
  Tooltip as UiTooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
}

/**
 * ホバー / フォーカスで表示されるツールチップ。
 * Radix UI Tooltip ベースでキーボード・スクリーンリーダー対応済み。
 */
export function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipProvider>
      <UiTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  )
}
