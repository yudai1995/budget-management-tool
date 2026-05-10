'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * Sonner トースト。
 * app/layout.tsx に <Toaster /> を1箇所配置するだけで全ページで使用可能。
 * toast() / toast.success() / toast.error() で呼び出す。
 */
function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl border-2 border-[#1c1410]/10 bg-white text-[#1c1410] shadow-lg text-sm font-medium',
          title: 'font-semibold',
          description: 'text-[#1c1410]/60',
          success: 'border-[#35b5a2]/30 bg-[#ecfaf8]',
          error: 'border-[#f43f5e]/30 bg-[#fff1f2]',
          actionButton: 'bg-[#f18840] text-white rounded-lg px-3 py-1.5 text-xs font-bold',
          cancelButton: 'bg-[#1c1410]/10 text-[#1c1410] rounded-lg px-3 py-1.5 text-xs',
        },
      }}
    />
  )
}

export { Toaster }
