/**
 * CalendarPagePrototype — カレンダーページ（月/週切替 + ログ常時表示）
 *
 * レイアウト:
 * - 月ビュー PC: 左=大カレンダー / 右=日付グループ別ログ（sticky スクロール）
 * - 月ビュー SP: 上=カレンダー / 下=選択日ログ（ドロワー）
 * - 週ビュー:   週予算バー → 7日カード → その週の全ログ（全幅）
 * - ビュー設定は「ユーザー設定で保存できる」旨をヘッダーに表示
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer } from 'vaul'
import {
  ChevronLeft, ChevronRight, Plus, FileText,
  Home, Calendar, BarChart2, Settings, Bell, Info,
} from 'lucide-react'
import {
  EXPENSE_CATEGORIES as EXPENSE_TOKEN_LIST,
  INCOME_CATEGORIES  as INCOME_TOKEN_LIST,
} from '../tokens/categoryTokens'

const C = {
  bg:         '#fffdf5',
  card:       '#ffffff',
  text:       '#1c1410',
  muted:      'rgba(28,20,16,0.45)',
  mutedLight: 'rgba(28,20,16,0.22)',
  border:     'rgba(28,20,16,0.10)',
  brand:      '#f18840',
  brandDeep:  '#d4601e',
  brandLight: '#fff6ee',
  income:     '#35b5a2',
  incomeDeep: '#1d9181',
  danger:     '#f43f5e',
  shadow:     '0 2px 12px rgba(28,20,16,0.06), 0 0 0 1px rgba(28,20,16,0.04)',
} as const

const SPRING = {
  snap:   { type: 'spring' as const, stiffness: 600, damping: 35 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 26 },
}

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

type Expense = {
  id: string; date: string; balanceType: 0 | 1
  amount: number; category: string; note: string
}

const INITIAL_EXPENSES: Expense[] = [
  { id: '1',  date: '2026-05-05', balanceType: 0, amount: 850,    category: '食費',   note: 'コンビニ' },
  { id: '2',  date: '2026-05-05', balanceType: 0, amount: 3200,   category: '日用品', note: 'ドラッグストア' },
  { id: '3',  date: '2026-05-07', balanceType: 0, amount: 12000,  category: '交通費', note: '定期代' },
  { id: '4',  date: '2026-05-07', balanceType: 1, amount: 250000, category: '給料',   note: '5月分給料' },
  { id: '5',  date: '2026-05-10', balanceType: 0, amount: 4500,   category: '食費',   note: 'スーパー' },
  { id: '6',  date: '2026-05-10', balanceType: 0, amount: 980,    category: '食費',   note: 'ランチ' },
  { id: '7',  date: '2026-05-12', balanceType: 0, amount: 15000,  category: '衣類',   note: 'ユニクロ' },
  { id: '8',  date: '2026-05-15', balanceType: 0, amount: 2800,   category: '食費',   note: 'まとめ買い' },
  { id: '9',  date: '2026-05-18', balanceType: 0, amount: 500,    category: '趣味',   note: 'コーヒー' },
  { id: '10', date: '2026-05-20', balanceType: 0, amount: 8000,   category: '医療費', note: '歯科' },
]

const TODAY_STR = '2026-05-15'
const DAILY_BUDGET = 3800

type DayData = {
  date: Date; dateStr: string
  isCurrentMonth: boolean; isToday: boolean
  outgo: number; income: number
}

function buildCalendarDays(year: number, month: number, expenses: Expense[]): DayData[] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const days: DayData[] = []
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    days.push({ date: d, dateStr, isCurrentMonth: false, isToday: false, outgo: 0, income: 0 })
  }
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, month, day)
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const ex = expenses.filter(e => e.date === dateStr)
    days.push({
      date: d, dateStr, isCurrentMonth: true, isToday: dateStr === TODAY_STR,
      outgo:  ex.filter(e => e.balanceType===0).reduce((s,e) => s+e.amount, 0),
      income: ex.filter(e => e.balanceType===1).reduce((s,e) => s+e.amount, 0),
    })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month+1, i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    days.push({ date: d, dateStr, isCurrentMonth: false, isToday: false, outgo: 0, income: 0 })
  }
  return days
}

function getWeekIndex(days: DayData[], dateStr: string): number {
  const idx = days.findIndex(d => d.dateStr === dateStr)
  return idx >= 0 ? Math.floor(idx / 7) : 2
}

function getWeekDays(days: DayData[], weekIdx: number): DayData[] {
  return days.slice(weekIdx * 7, weekIdx * 7 + 7)
}

function groupByDate(expenses: Expense[]) {
  const map = new Map<string, Expense[]>()
  for (const ex of expenses) {
    const list = map.get(ex.date) ?? []
    list.push(ex)
    map.set(ex.date, list)
  }
  return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b))
}

function ExpenseItem({ e, onClick }: { e: Expense; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] active:bg-black/[0.04]"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{e.category}</p>
        <p className="text-[14px] font-semibold truncate" style={{ color: C.text }}>{e.note}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className="text-[14px] font-extrabold tabular-nums"
          style={{ color: e.balanceType===0 ? C.brand : C.income }}>
          {e.balanceType===0?'−':'+'}¥{e.amount.toLocaleString()}
        </p>
        {onClick && (
          <ChevronRight size={14} style={{ color: C.mutedLight }} />
        )}
      </div>
    </button>
  )
}

function EmptyRecord() {
  return (
    <div className="flex flex-col items-center py-10" style={{ color: C.mutedLight }}>
      <FileText size={28} className="mb-2 opacity-50" />
      <p className="text-[13px]">この日の記録はありません</p>
    </div>
  )
}

// PC (lg+) かどうかを判定するフック
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

type EntryDrawerProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  editingRecord?: Expense | null
  onSave?: (updated: Omit<Expense, 'id' | 'date'>) => void
}

function EntryDrawer({ open, onOpenChange, editingRecord, onSave }: EntryDrawerProps) {
  const isEdit    = !!editingRecord
  const isDesktop = useIsDesktop()

  const [amount,   setAmount]   = useState('')
  const [note,     setNote]     = useState('')
  const [category, setCategory] = useState('食費')
  const [type,     setType]     = useState<0|1>(0)

  // 編集モードで開いたときにプレ入力
  const prevOpen = useRef(false)
  if (open && !prevOpen.current && editingRecord) {
    setAmount(editingRecord.amount.toString())
    setNote(editingRecord.note)
    setCategory(editingRecord.category)
    setType(editingRecord.balanceType)
  }
  prevOpen.current = open

  // useEffect より先に定義する必要があるため const で宣言
  const handleClose = () => {
    setAmount(''); setNote(''); setCategory('食費'); setType(0)
    onOpenChange(false)
  }

  // Escape キーでモーダルを閉じる
  useEffect(() => {
    if (!open || !isDesktop) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isDesktop])

  const cats   = type===0 ? EXPENSE_TOKEN_LIST.map(t => t.name) : INCOME_TOKEN_LIST.map(t => t.name)
  const accent = type===0 ? C.brand : C.income

  function handleSubmit() {
    if (!amount || Number(amount) <= 0) return
    onSave?.({ balanceType: type, amount: Number(amount), category, note })
    handleClose()
  }

  // フォーム本体（モーダル・ドロワー共通）
  function FormContent() {
    return (
      <div className="flex flex-col gap-4">
        {/* 収支タイプ */}
        <div role="tablist" className="flex rounded-xl p-1" style={{ background: 'rgba(28,20,16,0.06)' }}>
          {([0,1] as const).map(t => (
            <button key={t} type="button" role="tab" aria-selected={type===t}
              onClick={() => { setType(t); if (!isEdit) setCategory(t===0?'食費':'給料') }}
              className="flex-1 rounded-lg py-2 text-sm font-bold transition-all"
              style={type===t ? { background: t===0?C.brand:C.income, color: '#fff' } : { color: C.muted }}>
              {t===0?'支出':'収入'}
            </button>
          ))}
        </div>

        {/* 金額 */}
        <div className="px-4 py-3" style={{ borderRadius: 14, background: 'rgba(28,20,16,0.03)', border: `1px solid ${C.border}` }}>
          <div className="text-[10px] font-semibold mb-1" style={{ color: C.muted }}>金額</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold" style={{ color: accent }}>¥</span>
            <input type="number" inputMode="numeric" placeholder="0" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-3xl font-extrabold tabular-nums outline-none"
              style={{ color: accent }}
              autoFocus
            />
          </div>
        </div>

        {/* メモ */}
        <div className="px-4 py-3" style={{ borderRadius: 14, background: 'rgba(28,20,16,0.03)', border: `1px solid ${C.border}` }}>
          <div className="text-[10px] font-semibold mb-1" style={{ color: C.muted }}>メモ</div>
          <input
            type="text"
            placeholder="例: スーパーで買い物"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
            style={{ color: C.text }}
          />
        </div>

        {/* カテゴリ */}
        <div>
          <div className="text-[10px] font-semibold mb-2 px-0.5" style={{ color: C.muted }}>カテゴリ</div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="radiogroup">
            {cats.map(cat => (
              <button key={cat} type="button" role="radio" aria-checked={category===cat}
                onClick={() => setCategory(cat)}
                className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all"
                style={category===cat ? { background: accent, borderColor: accent, color: '#fff' } : { background: C.card, borderColor: C.border, color: C.muted }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 送信 */}
        <button type="button" disabled={!amount||Number(amount)<=0}
          onClick={handleSubmit}
          className="w-full rounded-2xl py-4 text-base font-extrabold text-white disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${accent}, ${type===0?C.brandDeep:C.incomeDeep})` }}>
          {isEdit ? '変更を保存する' : '記録する'}
        </button>
      </div>
    )
  }

  // ── PC: モーダル ──────────────────────────────────────────────────────
  if (isDesktop) {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog" aria-modal="true" aria-label={isEdit ? '記録を編集' : 'クイック記録'}>
        {/* オーバーレイ */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(28,20,16,0.40)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={handleClose}
        />
        {/* モーダルカード */}
        <motion.div
          className="relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl"
          style={{ background: C.card }}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        >
          {/* モーダルヘッダー */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-extrabold" style={{ color: C.text }}>
              {isEdit ? '記録を編集' : 'クイック記録'}
            </h2>
            <button type="button" onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors"
              style={{ color: C.muted }} aria-label="閉じる">
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
          <FormContent />
        </motion.div>
      </div>
    )
  }

  // ── SP: ドロワー ──────────────────────────────────────────────────────
  return (
    <Drawer.Root open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40"
          style={{ background: 'rgba(28,20,16,0.36)', backdropFilter: 'blur(4px)' }} />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl outline-none"
          style={{ background: C.card, boxShadow: '0 -4px 32px rgba(28,20,16,0.16)' }}>
          <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full" style={{ background: C.mutedLight }} />
          <Drawer.Title className="px-5 pt-2 pb-1 text-[14px] font-extrabold" style={{ color: C.text }}>
            {isEdit ? '記録を編集' : 'クイック記録'}
          </Drawer.Title>
          <div className="px-5 pb-8 pt-2">
            <FormContent />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

const NAV_ITEMS = [
  { label: 'ホーム',     icon: Home,     to: '/home',              active: false },
  { label: 'カレンダー', icon: Calendar,  to: '/calendar-page',     active: true  },
  { label: 'レポート',   icon: BarChart2, to: '/asset-outlook-ab',  active: false },
  { label: '設定',       icon: Settings,  to: '/personal-settings', active: false },
]

export function CalendarPagePrototype() {
  const [year, setYear]   = useState(2026)
  const [month, setMonth] = useState(4)
  const [viewMode, setViewMode]   = useState<'month'|'week'>('month')
  const [selectedDate, setSelectedDate] = useState<string|null>(TODAY_STR)
  const [showEntry, setShowEntry]       = useState(false)
  const [showInfo, setShowInfo]         = useState(false)
  const [showDayDrawer, setShowDayDrawer] = useState(false)
  // 記録の編集
  const [expenses, setExpenses]           = useState<Expense[]>(INITIAL_EXPENSES)
  const [editingRecord, setEditingRecord] = useState<Expense | null>(null)
  const [showEditDrawer, setShowEditDrawer] = useState(false)

  const days      = buildCalendarDays(year, month, expenses)
  const weekIdx   = selectedDate ? getWeekIndex(days, selectedDate) : 2
  const weekDays  = getWeekDays(days, weekIdx)
  const grouped   = groupByDate(expenses)

  const groupRefs = useRef<Record<string, HTMLDivElement|null>>({})

  const prevMonth = () => { if (month===0) { setYear(y=>y-1); setMonth(11) } else { setMonth(m=>m-1) } }
  const nextMonth = () => { if (month===11) { setYear(y=>y+1); setMonth(0) } else { setMonth(m=>m+1) } }
  const prevWeek  = () => {
    const ni = weekIdx - 1
    if (ni < 0) { prevMonth(); return }
    const target = getWeekDays(days, ni).find(d => d.isCurrentMonth)
    if (target) setSelectedDate(target.dateStr)
  }
  const nextWeek  = () => {
    const ni = weekIdx + 1
    if (ni > 5) { nextMonth(); return }
    const target = getWeekDays(days, ni).find(d => d.isCurrentMonth)
    if (target) setSelectedDate(target.dateStr)
  }

  function handleDaySelect(dateStr: string) {
    setSelectedDate(dateStr)
    const ref = groupRefs.current[dateStr]
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setShowDayDrawer(true)
  }

  function handleEditRecord(record: Expense) {
    setEditingRecord(record)
    setShowEditDrawer(true)
  }

  function handleSaveEdit(updated: Omit<Expense, 'id' | 'date'>) {
    if (!editingRecord) return
    setExpenses(prev =>
      prev.map(e => e.id === editingRecord.id ? { ...e, ...updated } : e)
    )
    setEditingRecord(null)
  }

  const weekBudget = DAILY_BUDGET * 7
  const weekOutgo  = weekDays.reduce((s,d) => s+d.outgo, 0)
  const weekPct    = Math.min(100, (weekOutgo/weekBudget)*100)
  const weekOver   = weekOutgo > weekBudget

  // monthDays は将来の拡張用（現在は monthOutgo/monthIn で直接フィルタ）
  void days.filter(d => d.isCurrentMonth)
  const monthOutgo = expenses.filter(e => e.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    .filter(e => e.balanceType===0).reduce((s,e) => s+e.amount, 0)
  const monthIn    = expenses.filter(e => e.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    .filter(e => e.balanceType===1).reduce((s,e) => s+e.amount, 0)

  return (
    <div className="min-h-screen pb-32 lg:pb-16" style={{ background: C.bg, color: C.text }}>

      {/* Header */}
      <motion.header className="sticky top-0 z-20 flex h-14 items-center border-b px-4 md:px-6"
        style={{ borderColor: C.border, background: 'rgba(255,253,245,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2.5 shrink-0">
          <img src="/logo192.png" alt="家計かんり" className="h-8 w-8 shrink-0" style={{ borderRadius: '10px' }} />
          <span className="text-[15px] font-extrabold tracking-tight" style={{ color: C.text }}>家計かんり</span>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex" aria-label="メインメニュー">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.to} aria-current={item.active?'page':undefined}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold"
              style={{ borderRadius: '10px', background: item.active?C.brandLight:'transparent',
                color: item.active?C.brand:'rgba(28,20,16,0.50)', textDecoration: 'none' }}>
              <item.icon size={14} />{item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button type="button" className="flex h-8 w-8 items-center justify-center"
            style={{ color: C.muted }} aria-label="通知"><Bell size={17} /></button>
          <Link to="/my-page" className="flex h-8 w-8 items-center justify-center text-[12px] font-bold text-white"
            style={{ background: C.brand, borderRadius: '50%', textDecoration: 'none' }} aria-label="マイページ">Y</Link>
        </div>
      </motion.header>

      <main className="mx-auto max-w-5xl px-4 py-4 md:px-6 space-y-4">

        {/* ビュー切替ツールバー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button type="button"
              onClick={viewMode==='month' ? prevMonth : prevWeek}
              whileTap={{ scale: 0.88 }} transition={SPRING.snap}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/[0.04]"
              style={{ color: C.text }} aria-label="前へ">
              <ChevronLeft size={16} />
            </motion.button>
            <span className="text-[15px] font-extrabold" style={{ color: C.text }}>
              {year}年{month+1}月
              {viewMode==='week' && ` 第${weekIdx+1}週`}
            </span>
            <motion.button type="button"
              onClick={viewMode==='month' ? nextMonth : nextWeek}
              whileTap={{ scale: 0.88 }} transition={SPRING.snap}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/[0.04]"
              style={{ color: C.text }} aria-label="次へ">
              <ChevronRight size={16} />
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex rounded-xl p-0.5" style={{ background: 'rgba(28,20,16,0.06)' }} role="tablist">
              {(['month','week'] as const).map(mode => (
                <motion.button key={mode} type="button" role="tab" aria-selected={viewMode===mode}
                  onClick={() => setViewMode(mode)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  style={{ background: viewMode===mode ? C.brand : 'transparent',
                    color: viewMode===mode ? '#fff' : C.muted }}
                  whileTap={{ scale: 0.95 }}>
                  {mode==='month' ? '月' : '週'}
                </motion.button>
              ))}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setShowInfo(v => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/[0.04]"
                style={{ color: C.mutedLight }} aria-label="ビュー設定について">
                <Info size={14} />
              </button>
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    className="absolute right-0 top-9 z-10 rounded-xl border px-3 py-2 text-[11px] font-medium shadow-lg whitespace-nowrap"
                    style={{ background: C.card, borderColor: C.border, color: C.muted, boxShadow: C.shadow }}
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={SPRING.snap}
                  >
                    デフォルトのビューは設定から変更できます
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <AnimatePresence mode="wait">
          {viewMode === 'month' ? (
            // 月ビュー: 大カレンダー + ログ常時表示
            <motion.div key="month"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={SPRING.smooth}
              className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:gap-5 lg:items-start">

              {/* 左: フルサイズカレンダー */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ background: C.card, borderColor: C.border, boxShadow: C.shadow }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[9px] font-semibold" style={{ color: C.muted }}>支出</div>
                      <div className="text-[13px] font-extrabold tabular-nums" style={{ color: C.brand }}>
                        ¥{(monthOutgo/10000).toFixed(1)}万
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold" style={{ color: C.muted }}>収入</div>
                      <div className="text-[13px] font-extrabold tabular-nums" style={{ color: C.income }}>
                        ¥{(monthIn/10000).toFixed(1)}万
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7" style={{ background: 'rgba(28,20,16,0.02)' }}>
                  {WEEK_DAYS.map((d, i) => (
                    <div key={d} className="py-2 text-center text-[11px] font-extrabold"
                      style={{ color: i===0?C.danger:i===6?C.income:C.muted }}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {days.map((day, idx) => {
                    const isSelected = day.dateStr === selectedDate
                    return (
                      <button
                        key={day.dateStr+(day.isCurrentMonth?'':'-p'+idx)}
                        type="button"
                        onClick={() => day.isCurrentMonth && handleDaySelect(day.dateStr)}
                        disabled={!day.isCurrentMonth}
                        className="relative flex flex-col items-center justify-center py-1.5 transition-colors"
                        style={{
                          height: 56,
                          cursor: day.isCurrentMonth ? 'pointer' : 'default',
                          background: isSelected ? C.brandLight : 'transparent',
                          borderRight:  `1px solid ${C.border}`,
                          borderBottom: `1px solid ${C.border}`,
                        }}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold leading-none"
                          style={{
                            color:      !day.isCurrentMonth?C.mutedLight:isSelected?'#fff':day.isToday?C.brand:C.text,
                            background: isSelected ? C.brand : 'transparent',
                            border:     !isSelected&&day.isToday ? `1.5px solid ${C.brand}` : 'none',
                          }}>
                          {day.date.getDate()}
                        </span>
                        {day.isCurrentMonth && day.outgo > 0 && (
                          <span className="text-[8px] font-bold leading-none mt-0.5 tabular-nums"
                            style={{ color: isSelected?C.brand:C.muted }}>
                            {day.outgo >= 10000
                              ? `¥${(day.outgo/10000).toFixed(0)}万`
                              : `¥${(day.outgo/1000).toFixed(0)}k`}
                          </span>
                        )}
                        {day.isCurrentMonth && day.income > 0 && (
                          <span className="h-1 w-1 rounded-full mt-0.5" style={{ background: C.income }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 右: ログタイムライン (PC sticky) */}
              <div className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-2 pb-2">
                <div className="flex items-center justify-between px-0.5 mb-1">
                  <span className="text-[13px] font-extrabold" style={{ color: C.text }}>記録</span>
                  <span className="text-[11px] font-semibold" style={{ color: C.muted }}>{grouped.length}日分</span>
                </div>
                {grouped.map(([dateStr, records]) => {
                  const isSelected = dateStr === selectedDate
                  const date = new Date(dateStr + 'T00:00:00')
                  const label = date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
                  const dayOut = records.filter(e=>e.balanceType===0).reduce((s,e)=>s+e.amount,0)
                  const dayIn  = records.filter(e=>e.balanceType===1).reduce((s,e)=>s+e.amount,0)
                  return (
                    <div key={dateStr}
                      ref={el => { groupRefs.current[dateStr] = el }}
                      className="rounded-2xl border overflow-hidden cursor-pointer transition-all"
                      style={{
                        borderColor: isSelected ? C.brand : C.border,
                        boxShadow: isSelected ? `0 0 0 2px ${C.brand}30, ${C.shadow}` : C.shadow,
                        background: C.card,
                      }}
                      onClick={() => setSelectedDate(dateStr)}>
                      <div className="flex items-center justify-between px-3 py-2.5 border-b"
                        style={{ borderColor: C.border, background: isSelected?C.brandLight:'rgba(28,20,16,0.01)' }}>
                        <span className="text-[12px] font-extrabold" style={{ color: isSelected?C.brand:C.text }}>
                          {label}
                          {dateStr===TODAY_STR && (
                            <span className="ml-1.5 text-[9px] font-bold rounded-full px-1.5 py-0.5"
                              style={{ background: C.brand, color: '#fff' }}>今日</span>
                          )}
                        </span>
                        <div className="flex gap-2">
                          {dayOut>0&&<span className="text-[11px] font-extrabold tabular-nums" style={{ color: C.brand }}>−¥{dayOut.toLocaleString()}</span>}
                          {dayIn>0&&<span className="text-[11px] font-extrabold tabular-nums" style={{ color: C.income }}>+¥{dayIn.toLocaleString()}</span>}
                        </div>
                      </div>
                      {records.map((e, i) => (
                        <div key={e.id} className={i < records.length-1 ? 'border-b' : ''} style={{ borderColor: C.border }}>
                          <ExpenseItem e={e} onClick={() => handleEditRecord(e)} />
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            // 週ビュー: 週予算バー → 7日カード → 週全体ログ
            <motion.div key="week"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={SPRING.smooth}
              className="space-y-4">

              {/* 週予算プログレスバー */}
              <div className="rounded-2xl border p-4"
                style={{ background: C.card, borderColor: C.border, boxShadow: C.shadow }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold" style={{ color: C.muted }}>今週の支出</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[15px] font-extrabold tabular-nums"
                      style={{ color: weekOver ? C.danger : C.text }}>
                      ¥{weekOutgo.toLocaleString()}
                    </span>
                    <span className="text-[11px]" style={{ color: C.muted }}>/ ¥{weekBudget.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(28,20,16,0.08)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: weekOver ? C.danger : C.brand }}
                    animate={{ width: `${weekPct}%` }} transition={SPRING.smooth} />
                </div>
                {weekOver && (
                  <p className="text-[10px] font-semibold mt-1.5" style={{ color: C.danger }}>
                    週予算を ¥{(weekOutgo-weekBudget).toLocaleString()} 超過しています
                  </p>
                )}
              </div>

              {/* 7日カード */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => {
                  const isSelected = day.dateStr === selectedDate
                  const isOver = day.outgo > DAILY_BUDGET
                  return (
                    <motion.button key={day.dateStr} type="button"
                      onClick={() => setSelectedDate(day.dateStr)}
                      whileTap={{ scale: 0.95 }} transition={SPRING.snap}
                      className="flex flex-col items-center rounded-2xl py-3 px-1 border transition-colors"
                      style={{
                        background:  isSelected ? C.brand : day.isToday ? C.brandLight : C.card,
                        borderColor: isSelected ? C.brand : C.border,
                        boxShadow:   isSelected ? `0 4px 16px ${C.brand}40` : 'none',
                      }}>
                      <span className="text-[9px] font-bold mb-1"
                        style={{ color: isSelected?'rgba(255,255,255,0.7)':C.muted }}>
                        {WEEK_DAYS[day.date.getDay()]}
                      </span>
                      <span className="text-[14px] font-extrabold"
                        style={{ color: isSelected?'#fff':day.isToday?C.brand:C.text }}>
                        {day.date.getDate()}
                      </span>
                      {day.outgo > 0 && (
                        <span className="text-[8px] font-bold mt-1 tabular-nums"
                          style={{ color: isSelected?'rgba(255,255,255,0.85)':isOver?C.danger:C.brand }}>
                          {day.outgo>=10000 ? `¥${(day.outgo/10000).toFixed(0)}万` : `¥${(day.outgo/1000).toFixed(0)}k`}
                        </span>
                      )}
                      {day.income > 0 && !day.outgo && (
                        <span className="h-1 w-1 rounded-full mt-1"
                          style={{ background: isSelected?'rgba(255,255,255,0.7)':C.income }} />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* 週全体ログ */}
              {(() => {
                const weekDateStrs = new Set(weekDays.map(d => d.dateStr))
                const weekGrouped  = groupByDate(expenses.filter(e => weekDateStrs.has(e.date)))
                if (weekGrouped.length === 0) return (
                  <div className="flex flex-col items-center py-12" style={{ color: C.mutedLight }}>
                    <FileText size={28} className="mb-2 opacity-50" />
                    <p className="text-[13px]">今週の記録はありません</p>
                  </div>
                )
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weekGrouped.map(([dateStr, records]) => {
                      const isSelected = dateStr === selectedDate
                      const date = new Date(dateStr+'T00:00:00')
                      const label = date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
                      const dayOut = records.filter(e=>e.balanceType===0).reduce((s,e)=>s+e.amount,0)
                      const dayIn  = records.filter(e=>e.balanceType===1).reduce((s,e)=>s+e.amount,0)
                      return (
                        <motion.div key={dateStr}
                          className="rounded-2xl border overflow-hidden cursor-pointer"
                          style={{
                            borderColor: isSelected ? C.brand : C.border,
                            boxShadow: isSelected ? `0 0 0 2px ${C.brand}30, ${C.shadow}` : C.shadow,
                            background: C.card,
                          }}
                          onClick={() => setSelectedDate(dateStr)}
                          whileTap={{ scale: 0.995 }}>
                          <div className="flex items-center justify-between px-4 py-3 border-b"
                            style={{ borderColor: C.border, background: isSelected?C.brandLight:'rgba(28,20,16,0.01)' }}>
                            <span className="text-[13px] font-extrabold" style={{ color: isSelected?C.brand:C.text }}>
                              {label}
                              {dateStr===TODAY_STR && (
                                <span className="ml-2 text-[9px] font-bold rounded-full px-1.5 py-0.5"
                                  style={{ background: C.brand, color: '#fff' }}>今日</span>
                              )}
                            </span>
                            <div className="flex gap-2">
                              {dayOut>0&&<span className="text-[12px] font-extrabold tabular-nums" style={{ color: C.brand }}>−¥{dayOut.toLocaleString()}</span>}
                              {dayIn>0&&<span className="text-[12px] font-extrabold tabular-nums" style={{ color: C.income }}>+¥{dayIn.toLocaleString()}</span>}
                            </div>
                          </div>
                          {records.map((e, i) => (
                            <div key={e.id} className={i < records.length-1 ? 'border-b' : ''} style={{ borderColor: C.border }}>
                              <ExpenseItem e={e} onClick={() => handleEditRecord(e)} />
                            </div>
                          ))}
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SP: 選択日詳細ドロワー（月ビューのみ） */}
      <Drawer.Root open={showDayDrawer && viewMode==='month'} onOpenChange={setShowDayDrawer}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(28,20,16,0.36)', backdropFilter: 'blur(4px)' }} />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl outline-none lg:hidden"
            style={{ background: C.bg, boxShadow: '0 -4px 32px rgba(28,20,16,0.16)', maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full shrink-0" style={{ background: C.mutedLight }} />
            {selectedDate && (() => {
              const date = new Date(selectedDate + 'T00:00:00')
              const label = date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
              const records = expenses.filter(e => e.date === selectedDate)
              const dayOut  = records.filter(e=>e.balanceType===0).reduce((s,e)=>s+e.amount, 0)
              const dayIn   = records.filter(e=>e.balanceType===1).reduce((s,e)=>s+e.amount, 0)
              return (
                <div className="px-4 pt-2 pb-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <Drawer.Title className="text-[15px] font-extrabold" style={{ color: C.text }}>{label}</Drawer.Title>
                    <div className="flex gap-3">
                      {dayOut>0&&<span className="text-[13px] font-extrabold tabular-nums" style={{ color: C.brand }}>−¥{dayOut.toLocaleString()}</span>}
                      {dayIn>0&&<span className="text-[13px] font-extrabold tabular-nums" style={{ color: C.income }}>+¥{dayIn.toLocaleString()}</span>}
                    </div>
                  </div>
                  {records.length===0 ? <EmptyRecord /> : (
                    <div className="rounded-2xl border overflow-hidden"
                      style={{ background: C.card, borderColor: C.border }}>
                      {records.map((e, i) => (
                        <div key={e.id} className={i < records.length-1?'border-b':''} style={{ borderColor: C.border }}>
                          <ExpenseItem e={e} onClick={() => handleEditRecord(e)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* FAB */}
      <motion.button type="button" onClick={() => setShowEntry(true)}
        initial={{ opacity: 0, scale: 0.6, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...SPRING.smooth, delay: 0.4 }} whileTap={{ scale: 0.91 }}
        className="fixed right-5 z-40 flex h-14 items-center gap-2 px-6 text-sm font-bold text-white lg:hidden"
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom,0px))',
          background: `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`,
          borderRadius: 9999, boxShadow: '0 4px 20px rgba(241,136,64,0.32)' }}
        aria-label="記録する">
        <Plus size={18} strokeWidth={2.5} />記録する
      </motion.button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
        style={{ background: 'rgba(255,253,245,0.92)', backdropFilter: 'blur(16px)',
          borderTop: `1px solid ${C.border}`, paddingBottom: 'env(safe-area-inset-bottom,0px)' }}
        aria-label="メインメニュー">
        <div className="grid grid-cols-4 h-14">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.to} aria-current={item.active?'page':undefined}
              className="flex flex-col items-center justify-center gap-0.5"
              style={{ color: item.active?C.brand:'rgba(28,20,16,0.50)', textDecoration: 'none' }}>
              <item.icon size={20} strokeWidth={item.active?2.4:2} />
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 新規記録ドロワー */}
      <EntryDrawer
        open={showEntry}
        onOpenChange={setShowEntry}
        onSave={() => {/* 新規追加は今回スコープ外 */}}
      />

      {/* 編集ドロワー */}
      <EntryDrawer
        open={showEditDrawer}
        onOpenChange={v => { if (!v) { setShowEditDrawer(false); setEditingRecord(null) } }}
        editingRecord={editingRecord}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
