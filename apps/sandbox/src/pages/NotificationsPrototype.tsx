/**
 * NotificationsPrototype — 通知一覧画面のプロトタイプ
 *
 * 今後実装予定の通知機能の画面イメージ。
 * - 予算超過アラート
 * - 給料日リマインダー
 * - 連続記録達成バッジ
 */

import { Bell, AlertTriangle, Wallet, Flame, CheckCircle2 } from 'lucide-react'

type Notification = {
  id: string
  type: 'alert' | 'info' | 'achievement'
  title: string
  body: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: '今月の予算を超過しています',
    body: '食費が予算 ¥30,000 に対して ¥34,200 になりました。',
    time: '今日 07:00',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: '給料日まであと3日',
    body: '1日予算 ¥2,100 で乗り切りましょう。残高 ¥6,403。',
    time: '今日 06:30',
    read: false,
  },
  {
    id: '3',
    type: 'achievement',
    title: '🔥 7日連続記録達成！',
    body: '素晴らしい習慣です。このまま続けましょう。',
    time: '昨日 23:00',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: '月次レポートが作成されました',
    body: '4月の家計サマリーを確認できます。',
    time: '5/1 09:00',
    read: true,
  },
  {
    id: '5',
    type: 'alert',
    title: '光熱費の記録が3日ありません',
    body: '忘れている支出がないか確認してみましょう。',
    time: '4/28 18:00',
    read: true,
  },
]

const typeConfig = {
  alert: {
    icon: AlertTriangle,
    bg: '#fff1f2',
    border: 'rgba(244,63,94,0.20)',
    iconColor: '#f43f5e',
  },
  info: {
    icon: Wallet,
    bg: '#fff6ee',
    border: 'rgba(241,136,64,0.20)',
    iconColor: '#f18840',
  },
  achievement: {
    icon: Flame,
    bg: '#faf5ff',
    border: 'rgba(168,85,247,0.20)',
    iconColor: '#a855f7',
  },
}

export function NotificationsPrototype() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  return (
    <div
      className="min-h-screen"
      style={{ background: '#f5f3ef', fontFamily: 'var(--font-outfit, sans-serif)' }}
    >
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: 'rgba(245,243,239,0.90)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(28,20,16,0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <Bell size={18} style={{ color: '#1c1410' }} />
          <h1 className="text-base font-extrabold" style={{ color: '#1c1410' }}>
            通知
          </h1>
          {unread > 0 && (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold text-white"
              style={{ background: '#f43f5e' }}
            >
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            className="text-xs font-semibold"
            style={{ color: '#f18840' }}
          >
            すべて既読にする
          </button>
        )}
      </header>

      {/* 通知リスト */}
      <div className="mx-auto max-w-lg px-4 py-3 flex flex-col gap-2">
        {MOCK_NOTIFICATIONS.map((n) => {
          const cfg = typeConfig[n.type]
          const Icon = cfg.icon
          return (
            <div
              key={n.id}
              className="flex items-start gap-3 rounded-2xl border p-4 transition-colors"
              style={{
                background: n.read ? '#ffffff' : cfg.bg,
                borderColor: n.read ? 'rgba(28,20,16,0.08)' : cfg.border,
                opacity: n.read ? 0.72 : 1,
              }}
            >
              {/* アイコン */}
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <Icon size={15} style={{ color: cfg.iconColor }} />
              </div>

              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-bold leading-snug"
                    style={{ color: '#1c1410' }}
                  >
                    {n.title}
                  </p>
                  {!n.read && (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: '#f18840' }}
                    />
                  )}
                </div>
                <p
                  className="mt-0.5 text-xs leading-relaxed"
                  style={{ color: 'rgba(28,20,16,0.55)' }}
                >
                  {n.body}
                </p>
                <p
                  className="mt-1.5 text-[11px] font-semibold"
                  style={{ color: 'rgba(28,20,16,0.35)' }}
                >
                  {n.time}
                </p>
              </div>
            </div>
          )
        })}

        {MOCK_NOTIFICATIONS.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <CheckCircle2 size={40} style={{ color: 'rgba(28,20,16,0.18)' }} />
            <p className="text-sm font-semibold" style={{ color: 'rgba(28,20,16,0.40)' }}>
              通知はありません
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
