import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Calendar, BarChart2, Settings, Plus, ArrowLeft, X } from 'lucide-react'

type Tab = 'home' | 'calendar' | 'report' | 'settings'

export function BottomNavPrototype() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <div className="flex flex-col items-center" style={{ background: 'var(--color-surface-default)', minHeight: '100svh' }}>
      {/* 戻るリンク（デスクトップ用） */}
      <div className="w-full max-w-sm px-4 pt-4 pb-2">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-[#1c1410]/50 hover:text-[var(--color-brand-primary)] transition-colors">
          <ArrowLeft size={14} />
          Gallery に戻る
        </Link>
        <h1 className="mt-2 text-base font-bold text-[#1c1410]">ボトムナビゲーション試作</h1>
        <p className="text-xs text-[#1c1410]/50">モバイルサイズ（375px）で確認推奨</p>
      </div>

      {/* モバイル画面シミュレーター */}
      <div
        className="relative mx-auto flex flex-col overflow-hidden rounded-3xl border-4 border-[#1c1410]/20"
        style={{ width: 375, height: 720, background: 'var(--color-surface-default)' }}
      >
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
          {activeTab === 'home' && <HomeContent />}
          {activeTab === 'calendar' && <PlaceholderContent title="カレンダー" />}
          {activeTab === 'report' && <PlaceholderContent title="レポート" />}
          {activeTab === 'settings' && <PlaceholderContent title="設定" />}
        </div>

        {/* FAB オーバーレイ */}
        {fabOpen && (
          <div
            className="absolute inset-0 z-20 flex items-end justify-center pb-24"
            style={{ background: 'rgba(28, 20, 16, 0.5)' }}
            onClick={() => setFabOpen(false)}
          >
            <div
              className="flex flex-col items-center gap-3 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { label: '支出を記録', color: 'var(--color-expense)' },
                { label: '収入を記録', color: 'var(--color-income)' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="rounded-2xl border-2 border-[#1c1410] px-6 py-3 text-sm font-bold text-white"
                  style={{ background: item.color, boxShadow: 'var(--shadow-pop)' }}
                  onClick={() => setFabOpen(false)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ボトムナビゲーションバー */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t border-[#1c1410]/10 bg-white px-2 pb-safe"
          style={{ height: 72, paddingBottom: 8 }}
        >
          <NavButton icon={Home} label="ホーム" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={Calendar} label="カレンダー" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />

          {/* FAB（中央） */}
          <button
            type="button"
            aria-label="記録する"
            onClick={() => setFabOpen(!fabOpen)}
            className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#1c1410] transition-transform active:scale-95"
            style={{ background: 'var(--color-brand-primary)', boxShadow: 'var(--shadow-pop)' }}
          >
            {fabOpen
              ? <X size={22} className="text-white" />
              : <Plus size={22} className="text-white" />
            }
          </button>

          <NavButton icon={BarChart2} label="レポート" active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
          <NavButton icon={Settings} label="設定" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-3 py-2 transition-colors"
      style={{ color: active ? 'var(--color-brand-primary)' : 'rgba(28,20,16,0.4)' }}
    >
      <Icon size={22} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  )
}

function HomeContent() {
  return (
    <div className="flex flex-col gap-4">
      {/* 今月サマリーカード */}
      <div className="rounded-2xl border border-[#1c1410]/12 bg-white p-4">
        <p className="text-xs font-bold text-[#1c1410]/50">今月の支出</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums" style={{ color: 'var(--color-expense)' }}>
          ¥42,800
        </p>
        <div className="mt-3 flex gap-3 text-xs text-[#1c1410]/50">
          <span>収入 <strong className="text-[#1c1410]">¥200,000</strong></span>
          <span>残り <strong className="text-[#1c1410]">¥157,200</strong></span>
        </div>
      </div>

      {/* 最近の記録 */}
      <div className="rounded-2xl border border-[#1c1410]/12 bg-white p-4">
        <p className="text-xs font-bold text-[#1c1410]/50 mb-3">最近の記録</p>
        {[
          { label: 'スーパー', amount: -3200, date: '今日' },
          { label: 'ガソリン', amount: -5600, date: '昨日' },
          { label: '給与', amount: 200000, date: '5/25' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#1c1410]/6 last:border-0">
            <div>
              <p className="text-sm font-semibold text-[#1c1410]">{item.label}</p>
              <p className="text-xs text-[#1c1410]/40">{item.date}</p>
            </div>
            <p
              className="text-sm font-bold tabular-nums"
              style={{ color: item.amount < 0 ? 'var(--color-expense)' : 'var(--color-income)' }}
            >
              {item.amount < 0 ? '-' : '+'}¥{Math.abs(item.amount).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-[#1c1410]/30 font-medium">{title}（準備中）</p>
    </div>
  )
}
