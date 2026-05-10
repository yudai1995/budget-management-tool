import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-xl border-2 border-[#1c1410]/20 bg-white px-4 py-2.5 text-sm text-[#1c1410]',
        'min-h-[88px] resize-y',
        'placeholder:text-[#1c1410]/40',
        'transition-colors',
        'focus:outline-none focus:border-[#f18840] focus:ring-2 focus:ring-[#f18840]/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
