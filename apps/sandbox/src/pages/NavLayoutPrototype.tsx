/**
 * NavLayoutPrototype — ナビゲーション統合レイアウト試作
 *
 * 実際のアプリと同じ見た目でレイアウトを検証する。
 * - PC:     左サイドバー（展開220px / 折りたたみ64px）
 * - Mobile: ボトムナビ中央FABに「記録する」を統合
 *           → フロートボタンとの重複を解消
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Receipt, BarChart2, Settings,
  Plus, X, LogOut,
  ChevronLeft, ChevronRight,
  Bell,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

// ── 統一ナビゲーション定義（SSOT） ─────────────────────────────────────────
type NavItem = { path: string; label: string; icon: React.ElementType }

const NAV_ITEMS: NavItem[] = [
  { path: '/',        label: 'ホーム',   icon: Home },
  { path: '/meisai',  label: '明細',     icon: Receipt },
  { path: '/report',  label: 'レポート', icon: BarChart2 },
  { path: '/settings',label: '設定',     icon: Settings },
]

const MOCK_USER = 'yamamoto'

// ── Design tokens ──────────────────────────────────────────────────────────────
const brand      = '#f18840'
const brandDeep  = '#e8622a'
const brandLight = '#fff6ee'
const surface    = '#fffdf5'
const border     = 'rgba(28,20,16,0.08)'
const text       = '#1c1410'
const muted      = 'rgba(28,20,16,0.45)'
const income     = '#35b5a2'
const danger     = '#f43f5e'

const SPRING = {
  SNAP:  { type: 'spring', stiffness: 600, damping: 35 },
  QUICK: { type: 'spring', stiffness: 400, damping: 30 },
} as const

// ── AppLayout ──────────────────────────────────────────────────────────────────
function AppLayout({
  children,
  activeTab,
  onTabChange,
  collapsed,
  onCollapse,
  fabOpen,
  onFabToggle,
}: {
  children: React.ReactNode
  activeTab: string
  onTabChange: (p: string) => void
  collapsed: boolean
  onCollapse: () => void
  fabOpen: boolean
  onFabToggle: () => void
}) {
  const isActive = (path: string) =>
    path === '/' ? activeTab === '/' : activeTab.startsWith(path)

  const sideW = collapsed ? 64 : 220

  return (
    <div className="flex h-full">

      {/* ── PC 左サイドバー ──────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col border-r shrink-0"
        style={{ width: sideW, background: surface, borderColor: border, transition: 'width 0.2s ease' }}
      >
        {/* ロゴ */}
        <div className="flex h-14 items-center border-b px-3 gap-2.5 shrink-0"
          style={{ borderColor: border }}>
          <img src="/logo192.png" alt="家計かんり" className="h-8 w-8 shrink-0" style={{ borderRadius: 10 }} />
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[14px] font-extrabold tracking-tight" style={{ color: text }}>家計かんり</span>
              <span className="text-[10px]" style={{ color: muted }}>家計を、もっとシンプルに。</span>
            </div>
          )}
        </div>

        {/* ナビ項目 */}
        <nav className="flex flex-col gap-0.5 px-2 pt-3 flex-1" aria-label="メインナビゲーション">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path)
            const Icon   = item.icon
            return (
              <button key={item.path} type="button"
                onClick={() => onTabChange(item.path)}
                title={collapsed ? item.label : undefined}
                className="flex items-center rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors"
                style={{
                  gap:            collapsed ? 0 : 10,
                  background:     active ? brandLight : 'transparent',
                  color:          active ? brand : 'rgba(28,20,16,0.60)',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                <Icon size={18} className="shrink-0" />
                {!collapsed && item.label}
              </button>
            )
          })}
        </nav>

        {/* 記録するボタン（PC サイドバー内） */}
        <div className="px-2 pb-2">
          <button type="button"
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-[13px] font-bold text-white transition-transform active:scale-95"
            style={{
              background:     brand,
              boxShadow:      `0 4px 16px ${brand}40`,
              gap:            collapsed ? 0 : 8,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title={collapsed ? '記録する' : undefined}>
            <PenLine size={17} className="shrink-0" />
            {!collapsed && '記録する'}
          </button>
        </div>

        {/* ユーザー・ログアウト */}
        <div className="border-t px-2 py-2 flex items-center gap-1.5" style={{ borderColor: border }}>
          {!collapsed && (
            <span className="flex-1 truncate rounded-full border px-3 py-1 text-[12px] font-semibold"
              style={{ borderColor: border, background: brandLight, color: 'rgba(28,20,16,0.65)' }}>
              {MOCK_USER}
            </span>
          )}
          <button type="button"
            className="flex items-center justify-center rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[#fff6ee]"
            style={{ color: muted, gap: 4 }} title="ログアウト">
            <LogOut size={14} />
            {!collapsed && 'ログアウト'}
          </button>
        </div>

        {/* 折りたたみトグル */}
        <button type="button"
          aria-label={collapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
          onClick={onCollapse}
          className="flex w-full items-center justify-center border-t py-2 transition-colors hover:bg-[#fff6ee]"
          style={{ borderColor: border, color: muted }}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* ── コンテンツエリア ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* PC: ページタイトルバー */}
        <div className="hidden lg:flex h-14 items-center justify-between border-b px-6 shrink-0"
          style={{ background: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(10px)', borderColor: border }}>
          <h1 className="text-[13px] font-bold" style={{ color: muted }}>
            {NAV_ITEMS.find(i => isActive(i.path))?.label ?? 'ページ'}
          </h1>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full" style={{ color: muted }}>
              <Bell size={17} />
            </button>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${brand}, ${brandDeep})` }}>
              Y
            </div>
          </div>
        </div>

        {/* Mobile: ヘッダー（ロゴ＋通知＋アバターのみ。記録ボタンはFABに統合） */}
        <div className="lg:hidden flex h-14 items-center justify-between border-b px-4 shrink-0"
          style={{ background: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(10px)', borderColor: border }}>
          <div className="flex items-center gap-2">
            <img src="/logo192.png" alt="家計かんり" className="h-7 w-7 shrink-0" style={{ borderRadius: 8 }} />
            <span className="text-[15px] font-extrabold" style={{ color: text }}>家計かんり</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 通知ベル（バッジ付き） */}
            <div className="relative">
              <button className="flex h-8 w-8 items-center justify-center rounded-full" style={{ color: muted }}>
                <Bell size={18} />
              </button>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                style={{ background: danger }}>2</span>
            </div>
            {/* ユーザーアバター */}
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${brand}, ${brandDeep})`, boxShadow: `0 2px 8px ${brand}40` }}>
              Y
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" style={{ background: surface }}>
          {children}
        </main>
      </div>

      {/* ── Mobile: FAB展開シート ────────────────────────────────────── */}
      <AnimatePresence>
        {fabOpen && (
          <>
            {/* オーバーレイ */}
            <motion.div
              className="fixed inset-0 z-30 lg:hidden"
              style={{ background: 'rgba(28,20,16,0.45)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING.QUICK}
              onClick={onFabToggle}
            />
            {/* メニューシート */}
            <motion.div
              className="fixed bottom-16 left-4 right-4 z-40 lg:hidden rounded-2xl p-4"
              style={{ background: '#fff', boxShadow: '0 -4px 32px rgba(28,20,16,0.18)', border: `1px solid ${border}` }}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: 16, scale: 0.97 }}
              transition={SPRING.SNAP}
            >
              <p className="text-[11px] font-bold mb-3 text-center" style={{ color: muted }}>何を記録しますか？</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button"
                  onClick={onFabToggle}
                  className="flex flex-col items-center gap-2 rounded-2xl py-4 text-white font-bold text-[14px]"
                  style={{ background: income, boxShadow: `0 4px 16px ${income}40` }}>
                  <ArrowUpRight size={22} />
                  収入を記録
                </button>
                <button type="button"
                  onClick={onFabToggle}
                  className="flex flex-col items-center gap-2 rounded-2xl py-4 text-white font-bold text-[14px]"
                  style={{ background: danger, boxShadow: `0 4px 16px ${danger}40` }}>
                  <ArrowDownRight size={22} />
                  支出を記録
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile: ボトムナビ（中央FAB統合） ───────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          background:  'rgba(255,253,245,0.96)',
          backdropFilter: 'blur(16px)',
          borderTop:   `1px solid ${border}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        aria-label="モバイルナビゲーション"
      >
        <div className="flex items-center h-14">
          {/* 左2項目 */}
          {NAV_ITEMS.slice(0, 2).map(item => (
            <MobileNavBtn key={item.path} item={item}
              active={isActive(item.path)} onClick={() => onTabChange(item.path)} />
          ))}

          {/* 中央 FAB — ナビバーから突き出る */}
          <div className="flex flex-1 items-end justify-center pb-3">
            <motion.button
              type="button"
              aria-label={fabOpen ? 'メニューを閉じる' : '記録する'}
              aria-expanded={fabOpen}
              onClick={onFabToggle}
              className="flex flex-col items-center justify-center rounded-full text-white"
              style={{
                width:      56,
                height:     56,
                background: fabOpen
                  ? `linear-gradient(135deg, #555, #333)`
                  : `linear-gradient(135deg, ${brand}, ${brandDeep})`,
                boxShadow:  fabOpen
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : `0 4px 20px ${brand}55`,
              }}
              whileTap={{ scale: 0.90 }}
              transition={SPRING.SNAP}
            >
              <motion.div
                animate={{ rotate: fabOpen ? 45 : 0 }}
                transition={SPRING.SNAP}
              >
                {fabOpen ? <X size={22} /> : <Plus size={22} />}
              </motion.div>
            </motion.button>
          </div>

          {/* 右2項目 */}
          {NAV_ITEMS.slice(2).map(item => (
            <MobileNavBtn key={item.path} item={item}
              active={isActive(item.path)} onClick={() => onTabChange(item.path)} />
          ))}
        </div>
      </nav>

    </div>
  )
}

function MobileNavBtn({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <button type="button" onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 h-full transition-colors"
      style={{ color: active ? brand : 'rgba(28,20,16,0.38)' }}>
      <Icon size={21} strokeWidth={active ? 2.4 : 2} />
      <span className="text-[10px] font-bold">{item.label}</span>
    </button>
  )
}

// ── ページコンテンツ ───────────────────────────────────────────────────────
function HomeContent() {
  return (
    <div className="p-4 space-y-3 max-w-2xl">
      {/* 今月サマリー */}
      <div className="rounded-2xl p-4 border"
        style={{ background: '#fff', borderColor: border, boxShadow: '0 2px 12px rgba(28,20,16,0.07)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-bold" style={{ color: muted }}>今月のサマリー</span>
          <span className="text-[12px]" style={{ color: muted }}>2026 / 05</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[34px] font-extrabold tabular-nums" style={{ color: income }}>¥103,900</span>
          <span className="text-[13px] font-bold flex items-center gap-0.5" style={{ color: income }}>
            <ArrowUpRight size={14} />41%
          </span>
        </div>
        <div className="space-y-1.5 mb-3">
          {[
            { label: '収入',   value: 252600, color: income,  Icon: ArrowUpRight },
            { label: '支出',   value: 148700, color: brand,   Icon: ArrowDownRight },
            { label: '収支差', value: 103900, color: income,  Icon: null, bold: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[12px]" style={{ color: muted }}>
                {row.Icon && <row.Icon size={12} style={{ color: row.color }} />}
                {!row.Icon && <span className="w-3" />}
                {row.label}
              </span>
              <span className="text-[13px] font-bold tabular-nums"
                style={{ color: row.bold ? income : text }}>
                {row.bold ? '+' : ''}¥{row.value.toLocaleString('ja-JP')}
              </span>
            </div>
          ))}
        </div>
        {/* 貯蓄ランウェイ */}
        <div className="rounded-xl px-3 py-2.5 flex items-center justify-between"
          style={{ background: `${income}12` }}>
          <div>
            <p className="text-[10px] font-semibold mb-0.5" style={{ color: income }}>今のペースで貯蓄できる期間</p>
            <p className="text-[18px] font-extrabold" style={{ color: income }}>あと24ヶ月</p>
          </div>
          <span style={{ color: `${income}60`, fontSize: 28 }}>🏦</span>
        </div>
      </div>

      {/* 最近の記録 */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: '#fff', borderColor: border, boxShadow: '0 2px 12px rgba(28,20,16,0.07)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: border }}>
          <span className="text-[13px] font-bold" style={{ color: text }}>最近の記録</span>
          <button className="text-[12px] font-bold flex items-center gap-0.5" style={{ color: brand }}>
            すべて見る <ChevronRight size={13} />
          </button>
        </div>
        {[
          { group: '今日', items: [
            { label: 'スーパー',   sub: '食費',   amount: -1280, color: brand },
            { label: '電車',       sub: '交通費', amount:  -550, color: '#8b7cf8' },
          ]},
          { group: '昨日', items: [
            { label: 'ドラッグストア', sub: '日用品', amount: -2400, color: '#8b7cf8' },
          ]},
        ].map((group) => (
          <div key={group.group}>
            <div className="px-4 py-1.5 text-[11px] font-bold" style={{ background: surface, color: muted }}>
              {group.group}
            </div>
            {group.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                style={{ borderColor: border }}>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}14` }}>
                  <span style={{ color: item.color, fontSize: 16 }}>
                    {item.sub === '食費' ? '🛒' : item.sub === '交通費' ? '🚃' : '🛍'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: text }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: muted }}>{item.sub}</p>
                </div>
                <span className="text-[13px] font-extrabold tabular-nums shrink-0"
                  style={{ color: item.amount < 0 ? danger : income }}>
                  {item.amount < 0 ? '−' : '+'}¥{Math.abs(item.amount).toLocaleString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaceholderContent({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-[13px] font-medium" style={{ color: muted }}>{label}（準備中）</p>
    </div>
  )
}

// ── エントリポイント ───────────────────────────────────────────────────────
export function NavLayoutPrototype() {
  const [activeTab, setActiveTab] = useState('/')
  const [collapsed, setCollapsed] = useState(false)
  const [fabOpen,   setFabOpen]   = useState(false)

  const currentLabel = NAV_ITEMS.find(i =>
    i.path === '/' ? activeTab === '/' : activeTab.startsWith(i.path)
  )?.label ?? 'ページ'

  return (
    <div className="flex h-screen flex-col" style={{ background: surface }}>
      <div className="flex-1 min-h-0">
        <AppLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(v => !v)}
          fabOpen={fabOpen}
          onFabToggle={() => setFabOpen(v => !v)}
        >
          {activeTab === '/'         && <HomeContent />}
          {activeTab === '/calendar' && <PlaceholderContent label="カレンダー" />}
          {activeTab === '/report'   && <PlaceholderContent label="レポート" />}
          {activeTab === '/settings' && <PlaceholderContent label="設定" />}
        </AppLayout>
      </div>

      {/* PC: 下部メモバー */}
      <div className="hidden lg:block border-t px-6 py-2.5 text-[11px] shrink-0"
        style={{ borderColor: border, background: '#fafaf8', color: muted }}>
        <span className="font-bold" style={{ color: text }}>検証ポイント：</span>
        PC 左サイドバー / モバイル ボトムナビ中央FAB
        / 現在のページ:「{currentLabel}」
        / サイドバー:{collapsed ? '折りたたみ中' : '展開中'}
        <Link to="/" className="underline ml-2" style={{ color: brand }}>← Gallery に戻る</Link>
      </div>
    </div>
  )
}
