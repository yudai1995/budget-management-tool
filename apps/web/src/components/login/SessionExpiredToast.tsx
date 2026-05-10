'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * マウント時に「セッション切れ」トーストを1回だけ表示するコンポーネント。
 * LoginForm で returnTo がある場合に配置する。
 */
export function SessionExpiredToast() {
  useEffect(() => {
    toast.warning('セッションが切れました。再度ログインしてください。', {
      duration: 5000,
    })
  }, [])

  return null
}
