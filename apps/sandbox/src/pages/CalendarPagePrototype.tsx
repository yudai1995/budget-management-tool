import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, FileText, X } from 'lucide-react'

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

// ダミーデータ
const DUMMY_EXPENSES = [
  { id: '1', date: '2026-05-05', balanceType: 0, amount: 850, category: '食費', note: 'コンビニ' },
  { id: '2', date: '2026-05-05', balanceType: 0, amount: 3200, category: '日用品', note: 'ドラッグストア' },
  { id: '3', date: '2026-05-07', balanceType: 0, amount: 12000, category: '交通費', note: '定期代' },
  { id: '4', date: '2026-05-07', balanceType: 1, amount: 250000, category: '給料', note: '5月分給料' },
  { id: '5', date: '2026-05-10', balanceType: 0, amount: 4500, category: '食費', note: 'スーパー' },
  { id: '6', date: '2026-05-10', balanceType: 0, amount: 980, category: '食費', note: 'ランチ' },
  { id: '7', date: '2026-05-12', balanceType: 0, amount: 15000, category: '衣服', note: 'ユニクロ' },
  { id: '8', date: '2026-05-15', balanceType: 0, amount: 2800, category: '食費', note: 'まとめ買い' },
  { id: '9', date: '2026-05-18', balanceType: 0, amount: 500, category: '娯楽', note: 'コーヒー' },
  { id: '10', date: '2026-05-20', balanceType: 0, amount: 8000, category: '医療費', note: '歯科' },
]

type DayData = {
  date: Date
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  outgo: number
  income: number
}

function buildCalendarDays(year: number, month: number): DayData[] {
  const today = new Date(2026, 4, 10) // デモ用固定日付
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const days: DayData[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, dateStr: d.toISOString().split('T')[0], isCurrentMonth: false, isToday: false, outgo: 0, income: 0 })
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, month, day)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayExpenses = DUMMY_EXPENSES.filter((e) => e.date === dateStr)
    const outgo = dayExpenses.filter((e) => e.balanceType === 0).reduce((s, e) => s + e.amount, 0)
    const income = dayExpenses.filter((e) => e.balanceType === 1).reduce((s, e) => s + e.amount, 0)
    days.push({ date: d, dateStr, isCurrentMonth: true, isToday: d.getDate() === today.getDate() && month === today.getMonth(), outgo, income })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, dateStr: d.toISOString().split('T')[0], isCurrentMonth: false, isToday: false, outgo: 0, income: 0 })
  }

  return days
}

// コンパクト版カレンダー（モバイル向け: ドット表示のみ）
function CompactCalendar({
  year, month, days, selectedDate, onDaySelect, onPrevMonth, onNextMonth,
}: {
  year: number; month: number; days: DayData[]
  selectedDate: string | null; onDaySelect: (dateStr: string) => void
  onPrevMonth: () => void; onNextMonth: () => void
}) {
  return (
    <div className="rounded-2xl border-2 border-[#1c1410] bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-pop)' }}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b-2 border-[#1c1410] bg-[#f18840] px-4 py-2.5 text-white">
        <button type="button" onClick={onPrevMonth} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
          <ChevronLeft size={14} />
        </button>
        <h2 className="text-sm font-extrabold">{year}年{month + 1}月</h2>
        <button type="button" onClick={onNextMonth} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-[#e8c8b0] bg-[#fffdf5]">
        {WEEK_DAYS.map((d, i) => (
          <div key={d} className={['py-1.5 text-center text-xs font-extrabold', i === 0 ? 'text-[#f87171]' : i === 6 ? 'text-[#35b5a2]' : 'text-[#1c1410]/50'].join(' ')}>
            {d}
          </div>
        ))}
      </div>

      {/* 日付グリッド（コンパクト: h-9 per row, dots only） */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const isSelected = day.dateStr === selectedDate
          return (
            <button
              key={day.dateStr + (day.isCurrentMonth ? '' : `-pad${idx}`)}
              type="button"
              onClick={() => day.isCurrentMonth && onDaySelect(day.dateStr)}
              disabled={!day.isCurrentMonth}
              className={[
                'relative flex flex-col items-center justify-center border-b border-r border-[#e8c8b0] py-1 transition-colors',
                day.isCurrentMonth ? 'cursor-pointer hover:bg-[#fff6ee]' : 'cursor-default',
                isSelected ? 'bg-[#fff1e5]' : day.isToday ? 'bg-[#fff5ec]' : '',
              ].join(' ')}
              style={{ height: 44 }}
            >
              {/* 選択インジケーター */}
              {isSelected && (
                <span className="absolute inset-0 border-2 border-[#f18840] rounded-sm pointer-events-none" />
              )}
              {/* 日付 */}
              <span className={[
                'text-xs font-bold leading-none',
                !day.isCurrentMonth ? 'text-[#1c1410]/20'
                  : day.isToday ? 'rounded-full bg-[#f18840] px-1 text-white'
                  : 'text-[#1c1410]',
              ].join(' ')}>
                {day.date.getDate()}
              </span>
              {/* ドットのみ（数値なし） */}
              <div className="flex items-center gap-0.5 mt-0.5">
                {day.outgo > 0 && <span className="h-1.5 w-1.5 rounded-full bg-[#f18840]" />}
                {day.income > 0 && <span className="h-1.5 w-1.5 rounded-full bg-[#35b5a2]" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 選択日の収支サマリー
function DaySummary({ dateStr }: { dateStr: string }) {
  const expenses = DUMMY_EXPENSES.filter((e) => e.date === dateStr)
  const outgo = expenses.filter((e) => e.balanceType === 0).reduce((s, e) => s + e.amount, 0)
  const income = expenses.filter((e) => e.balanceType === 1).reduce((s, e) => s + e.amount, 0)
  const date = new Date(dateStr + 'T00:00:00')
  const label = date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="rounded-2xl border-2 border-[#1c1410] bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-pop-sm)' }}>
      <div className="px-4 py-3 border-b border-[#e8c8b0]">
        <p className="text-sm font-extrabold text-[#1c1410]">{label}</p>
      </div>
      <div className="flex gap-0 divide-x divide-[#e8c8b0]">
        <div className="flex-1 px-4 py-3 text-center">
          <p className="text-xs text-[#1c1410]/50 mb-0.5">支出</p>
          <p className="text-lg font-extrabold" style={{ color: outgo > 0 ? 'var(--color-expense)' : '#1c1410' }}>
            {outgo > 0 ? `¥${outgo.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="flex-1 px-4 py-3 text-center">
          <p className="text-xs text-[#1c1410]/50 mb-0.5">収入</p>
          <p className="text-lg font-extrabold" style={{ color: income > 0 ? 'var(--color-income)' : '#1c1410' }}>
            {income > 0 ? `¥${income.toLocaleString()}` : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

// 選択日の明細リスト
function DayExpenseList({ dateStr }: { dateStr: string }) {
  const expenses = DUMMY_EXPENSES.filter((e) => e.date === dateStr)
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[#1c1410]/30">
        <FileText size={32} className="mb-2 opacity-40" />
        <p className="text-sm">この日の記録はありません</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {expenses.map((e) => (
        <div key={e.id} className="flex items-center gap-3 rounded-xl border border-[#e8c8b0] bg-white px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#1c1410]/50">{e.category}</p>
            <p className="text-sm font-semibold text-[#1c1410] truncate">{e.note}</p>
          </div>
          <p className={['text-sm font-extrabold tabular-nums', e.balanceType === 0 ? '' : ''].join('')}
            style={{ color: e.balanceType === 0 ? 'var(--color-expense)' : 'var(--color-income)' }}>
            {e.balanceType === 0 ? '-' : '+'}¥{e.amount.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

// クイック入力ボトムシート（#184）
function QuickEntrySheet({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('食費')
  const [type, setType] = useState<0 | 1>(0) // 0:支出 1:収入

  const categories = type === 0
    ? ['食費', '日用品', '交通費', '医療費', '衣服', '娯楽', 'その他']
    : ['給料', '副収入', 'その他']

  const color = type === 0 ? 'var(--color-expense)' : 'var(--color-income)'

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end" style={{ background: 'rgba(28,20,16,0.4)' }}>
      <div className="rounded-t-3xl bg-white border-t-2 border-[#1c1410] overflow-hidden" style={{ boxShadow: '0 -4px 16px rgba(28,20,16,0.12)' }}>
        {/* シートハンドル */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-sm font-extrabold text-[#1c1410]">クイック記録</h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f0eb]">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-4">
          {/* 種別タブ */}
          <div className="flex rounded-xl border border-[#1c1410]/12 bg-[#f5f0eb] p-1">
            {([0, 1] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setType(t); setCategory(t === 0 ? '食費' : '給料') }}
                className="flex-1 rounded-lg py-2 text-sm font-bold transition-all"
                style={type === t ? { background: t === 0 ? 'var(--color-expense)' : 'var(--color-income)', color: '#fff' } : { color: 'rgba(28,20,16,0.4)' }}>
                {t === 0 ? '支出' : '収入'}
              </button>
            ))}
          </div>

          {/* 金額 */}
          <div className="rounded-xl border border-[#1c1410]/12 bg-[#fafaf8] px-4 py-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold" style={{ color }}>¥</span>
              <input type="number" inputMode="numeric" placeholder="0" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-3xl font-extrabold tabular-nums outline-none placeholder:text-[#1c1410]/20"
                style={{ color }} autoFocus />
            </div>
          </div>

          {/* カテゴリ（横スクロール選択） */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all"
                style={category === c
                  ? { background: color, borderColor: color, color: '#fff' }
                  : { background: '#fff', borderColor: 'rgba(28,20,16,0.12)', color: 'rgba(28,20,16,0.6)' }}>
                {c}
              </button>
            ))}
          </div>

          {/* 送信ボタン */}
          <button type="button" disabled={!amount || Number(amount) <= 0}
            onClick={onClose}
            className="w-full rounded-2xl py-4 text-base font-extrabold text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--color-brand-primary)' }}>
            記録する
          </button>
        </div>
      </div>
    </div>
  )
}

export function CalendarPagePrototype() {
  const now = new Date(2026, 4, 1) // デモ用固定
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-05-10')
  const [showQuickEntry, setShowQuickEntry] = useState(false)

  const days = buildCalendarDays(year, month)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else { setMonth(m => m - 1) } }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else { setMonth(m => m + 1) } }

  return (
    <div className="flex flex-col items-center" style={{ background: 'var(--color-surface-default)', minHeight: '100svh' }}>
      {/* Sandbox ナビ */}
      <div className="w-full max-w-sm px-4 pt-4 pb-2 flex-shrink-0">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-[#1c1410]/50 hover:text-[var(--color-brand-primary)] transition-colors">
          <ArrowLeft size={14} />Gallery に戻る
        </Link>
        <h1 className="mt-2 text-base font-bold text-[#1c1410]">カレンダーページ試作</h1>
        <p className="text-xs text-[#1c1410]/50">Issue #183 + #184 — モバイルファーストレイアウト</p>
      </div>

      {/* モバイル画面シミュレーター */}
      <div
        className="relative mx-auto flex flex-col overflow-hidden rounded-3xl border-4 border-[#1c1410]/20"
        style={{ width: 390, height: 720, background: 'var(--color-surface-default)' }}
      >
        {/* 疑似ヘッダー */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#e8c8b0] bg-white">
          <span className="text-sm font-extrabold text-[#1c1410]">カレンダー</span>
          <Link to="/expenses/new" onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1 rounded-full border-2 border-[#1c1410] bg-[#f18840] px-3 py-1 text-xs font-bold text-white">
            詳細記録
          </Link>
        </div>

        {/* スクロール可能コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {/* カレンダー（上部固定ゾーン） */}
          <div className="px-3 pt-3">
            <CompactCalendar
              year={year} month={month} days={days}
              selectedDate={selectedDate} onDaySelect={setSelectedDate}
              onPrevMonth={prevMonth} onNextMonth={nextMonth}
            />
          </div>

          {/* 日付選択エリア */}
          {selectedDate ? (
            <div className="px-3 pt-3 pb-24 flex flex-col gap-3">
              <DaySummary dateStr={selectedDate} />
              <p className="text-xs font-bold text-[#1c1410]/40 px-1">明細</p>
              <DayExpenseList dateStr={selectedDate} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#1c1410]/30">
              <p className="text-sm">日付をタップして明細を表示</p>
            </div>
          )}
        </div>

        {/* フローティング「+」ボタン（クイック記録） */}
        <div className="absolute bottom-4 right-4">
          <button
            type="button"
            onClick={() => setShowQuickEntry(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#1c1410] text-white transition-all active:scale-95"
            style={{ background: 'var(--color-brand-primary)', boxShadow: 'var(--shadow-pop)' }}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* クイック入力シート */}
        {showQuickEntry && <QuickEntrySheet onClose={() => setShowQuickEntry(false)} />}
      </div>

      {/* 説明 */}
      <div className="mt-4 w-full max-w-sm px-4 pb-8">
        <div className="rounded-xl border border-[#1c1410]/10 bg-white p-4 text-xs text-[#1c1410]/50 space-y-2">
          <p className="font-bold text-[#1c1410]/70">このプロトタイプの特徴（#183 + #184）</p>
          <ul className="list-disc list-inside space-y-1">
            <li><b>カレンダー最上部固定</b>: スクロールの起点がカレンダー</li>
            <li><b>ドット表示</b>: 金額の数値は非表示。赤=支出・青=収入ドットのみ</li>
            <li><b>日付タップ → 明細表示</b>: ページ遷移なし、State 更新で下に出る</li>
            <li><b>「詳細記録」ボタン</b>: ヘッダー右上 → 従来の詳細フォームへ</li>
            <li><b>「+」フローティングボタン</b>: クイック記録 (金額 + カテゴリのみ) のボトムシートが開く</li>
            <li><b>入力フォーム削除</b>: カレンダーページ内のフォームを排除</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
