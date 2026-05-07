import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  Calendar,
  BarChart2,
  Settings,
  Plus,
  X,
  Wallet,
  LogOut,
  PenLine,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// ─── 統一ナビゲーション定義（SSOT） ────────────────────────────────
type NavItem = {
  path: string
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',          label: 'ホーム',       icon: Home },
  { path: '/calendar',  label: 'カレンダー',   icon: Calendar },
  { path: '/report',    label: 'レポート',     icon: BarChart2 },
  { path: '/settings',  label: '設定',         icon: Settings },
]

// ─── デモ用モック値 ──────────────────────────────────────────────
const MOCK_USER = 'yamamoto'

// ─── レイアウト本体（PC サイドバー + モバイルボトムナビ） ────────────

type LayoutProps = {
  children: React.ReactNode
  activeTab: string
  onTabChange: (path: string) => void
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
  fabOpen: boolean
  onFabToggle: () => void
}

function AppLayout({
  children,
  activeTab,
  onTabChange,
  sidebarCollapsed,
  onSidebarToggle,
  fabOpen,
  onFabToggle,
}: LayoutProps) {
  const isActive = (path: string) =>
    path === '/' ? activeTab === '/' : activeTab.startsWith(path)

  return (
    <div className="flex h-full">
      {/* ─── PC: 左サイドバー ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col border-r border-[#1c1410]/10 bg-[#fffdf5] transition-all duration-200"
        style={{ width: sidebarCollapsed ? 64 : 220 }}
      >
        {/* ロゴ */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-[#1c1410]/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#f18840] text-white"
                style={{ boxShadow: 'var(--shadow-pop-sm)' }}
              >
                <Wallet size={16} strokeWidth={2.5} />
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-extrabold text-[#1c1410]">家計かんり</span>
                <span className="text-[10px] text-[#1c1410]/40">家計を、もっとシンプルに。</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <span
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#f18840] text-white"
              style={{ boxShadow: 'var(--shadow-pop-sm)' }}
            >
              <Wallet size={16} strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* ナビ項目 */}
        <nav className="flex flex-col gap-1 px-2 pt-3 flex-1" aria-label="メインナビゲーション">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onTabChange(item.path)}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors text-left',
                  active
                    ? 'bg-[#fff6ee] text-[#f18840]'
                    : 'text-[#1c1410]/70 hover:bg-[#fff6ee] hover:text-[#f18840]',
                ].join(' ')}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </button>
            )
          })}
        </nav>

        {/* 記録するボタン */}
        <div className="px-2 pb-3">
          <button
            type="button"
            className={[
              'flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-all active:scale-95',
              sidebarCollapsed ? 'justify-center' : 'gap-3',
            ].join(' ')}
            style={{ background: 'var(--color-brand-primary, #f08030)' }}
            title={sidebarCollapsed ? '記録する' : undefined}
          >
            <PenLine size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && '記録する'}
          </button>
        </div>

        {/* ユーザー・ログアウト */}
        <div className="border-t border-[#1c1410]/10 px-2 py-3 flex items-center gap-2">
          {!sidebarCollapsed && (
            <span className="flex-1 truncate rounded-full border border-[#1c1410]/10 bg-[#fff6ee] px-3 py-1 text-xs font-semibold text-[#1c1410]/70">
              {MOCK_USER}
            </span>
          )}
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#1c1410]/50 hover:bg-[#fff6ee] hover:text-[#1c1410] transition-colors"
            title="ログアウト"
          >
            <LogOut size={14} />
            {!sidebarCollapsed && 'ログアウト'}
          </button>
        </div>

        {/* 折りたたみトグル */}
        <button
          type="button"
          aria-label={sidebarCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
          onClick={onSidebarToggle}
          className="flex w-full items-center justify-center border-t border-[#1c1410]/10 py-2 text-[#1c1410]/30 hover:bg-[#fff6ee] hover:text-[#f18840] transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* ─── コンテンツエリア ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* PC: コンパクトなトップバー（ページタイトルのみ） */}
        <div className="hidden md:flex h-14 items-center border-b border-[#1c1410]/10 bg-[#fffdf5]/90 px-6">
          <h1 className="text-sm font-bold text-[#1c1410]/60">
            {NAV_ITEMS.find((i) => isActive(i.path))?.label ?? 'ページ'}
          </h1>
        </div>

        {/* モバイル: ミニヘッダー（ロゴ + 記録する） */}
        <div className="flex md:hidden h-14 items-center justify-between border-b border-[#1c1410]/10 bg-[#fffdf5]/90 px-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f18840] text-white"
              style={{ boxShadow: 'var(--shadow-pop-sm)' }}
            >
              <Wallet size={14} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-extrabold text-[#1c1410]">家計かんり</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: 'var(--color-brand-primary, #f08030)' }}
          >
            <PenLine size={13} />
            記録する
          </button>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* ─── モバイル: ボトムナビゲーション ──────────────────────── */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-[#1c1410]/50 flex items-end justify-center pb-20"
          onClick={onFabToggle}
        >
          <div
            className="flex flex-col items-center gap-3 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="rounded-2xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
              style={{ background: 'var(--color-income, #4caf82)' }}
              onClick={onFabToggle}
            >
              収入を記録
            </button>
            <button
              type="button"
              className="rounded-2xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
              style={{ background: 'var(--color-expense, #e05c5c)' }}
              onClick={onFabToggle}
            >
              支出を記録
            </button>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-[#1c1410]/10 bg-white md:hidden"
        style={{ height: 64, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="モバイルナビゲーション"
      >
        {/* 左2項目 */}
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <MobileNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            onClick={() => onTabChange(item.path)}
          />
        ))}

        {/* 中央 FAB */}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            aria-label={fabOpen ? 'メニューを閉じる' : '記録する'}
            aria-expanded={fabOpen}
            onClick={onFabToggle}
            className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
            style={{
              background: 'var(--color-brand-primary, #f08030)',
              boxShadow: '0 4px 16px rgba(240,128,48,0.4)',
            }}
          >
            {fabOpen ? (
              <X size={22} className="text-white" />
            ) : (
              <Plus size={22} className="text-white" />
            )}
          </button>
        </div>

        {/* 右2項目 */}
        {NAV_ITEMS.slice(2).map((item) => (
          <MobileNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            onClick={() => onTabChange(item.path)}
          />
        ))}
      </nav>
    </div>
  )
}

function MobileNavItem({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
      style={{ color: active ? 'var(--color-brand-primary, #f08030)' : 'rgba(28,20,16,0.4)' }}
    >
      <Icon size={22} />
      <span className="text-[10px] font-semibold">{item.label}</span>
    </button>
  )
}

// ─── ページコンテンツ ────────────────────────────────────────────

function HomeContent() {
  return (
    <div className="flex flex-col gap-4 p-4">
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
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-[#1c1410]/30 font-medium">{title}（準備中）</p>
    </div>
  )
}

// ─── エントリポイント ────────────────────────────────────────────

export function NavLayoutPrototype() {
  const [activeTab, setActiveTab] = useState('/')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <div className="flex flex-col" style={{ background: 'var(--color-surface-default)', minHeight: '100svh' }}>
      {/* ギャラリーへの戻るリンク */}
      <div className="w-full px-4 pt-4 pb-2 border-b border-[#1c1410]/8">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-[#1c1410]/50 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          Gallery に戻る
        </Link>
        <h1 className="mt-1 text-base font-bold text-[#1c1410]">ナビゲーション統合レイアウト試作</h1>
        <p className="text-xs text-[#1c1410]/50">
          PC: 左サイドバー（折りたたみ対応） / モバイル: ボトムナビ — NAV_ITEMS は1箇所で定義
        </p>
      </div>

      {/* PC: フル画面シミュレーター */}
      <div
        className="hidden md:flex mx-auto my-6 rounded-2xl border-2 border-[#1c1410]/20 overflow-hidden"
        style={{ width: 900, height: 560 }}
      >
        <AppLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed((v) => !v)}
          fabOpen={fabOpen}
          onFabToggle={() => setFabOpen((v) => !v)}
        >
          {activeTab === '/' && <HomeContent />}
          {activeTab !== '/' && (
            <PlaceholderContent
              title={NAV_ITEMS.find((i) => activeTab.startsWith(i.path) && i.path !== '/')?.label ?? 'ページ'}
            />
          )}
        </AppLayout>
      </div>

      {/* モバイル: 375px シミュレーター */}
      <div
        className="relative md:hidden mx-auto mt-4 flex flex-col overflow-hidden rounded-3xl border-4 border-[#1c1410]/20"
        style={{ width: 375, height: 720 }}
      >
        <AppLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sidebarCollapsed={false}
          onSidebarToggle={() => {}}
          fabOpen={fabOpen}
          onFabToggle={() => setFabOpen((v) => !v)}
        >
          {activeTab === '/' && <HomeContent />}
          {activeTab !== '/' && (
            <PlaceholderContent
              title={NAV_ITEMS.find((i) => activeTab.startsWith(i.path) && i.path !== '/')?.label ?? 'ページ'}
            />
          )}
        </AppLayout>
      </div>

      {/* 説明 */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-[#1c1410]/10 bg-white p-4 text-sm text-[#1c1410]/70">
          <p className="font-bold text-[#1c1410] mb-2">変更ポイント</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>NAV_ITEMS を1箇所で定義 → PC サイドバー・モバイルボトムナビ両方から参照</li>
            <li>PC: 左サイドバー（展開時220px / 折りたたみ時64px）＋ コンパクトトップバー</li>
            <li>モバイル: ミニヘッダー（ロゴ＋記録するボタン）＋ 現行のボトムナビ</li>
            <li>設定ページがPC/モバイル両方でナビに表示される（現在はモバイルのみ）</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
