/**
 * PersonalSettingsPrototype — 個人設定画面
 * 給料日・月収・固定費・残高などを通常ナビゲーションから設定できる画面
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  TrendingUp,
  Home,
  Zap,
  Car,
  ShoppingBag,
  Wallet,
  Heart,
} from 'lucide-react'

// ─── Spring プリセット ───────────────────────────────────────────────────
const SPRING = {
  SNAP: { type: 'spring', stiffness: 600, damping: 35 },
  QUICK: { type: 'spring', stiffness: 400, damping: 30 },
  BASE: { type: 'spring', stiffness: 300, damping: 28 },
  SMOOTH: { type: 'spring', stiffness: 200, damping: 26 },
} as const

// ─── デザイントークン ─────────────────────────────────────────────────────
const D = {
  bg: '#f5f3ef',
  card: '#ffffff',
  text: '#1c1410',
  muted: 'rgba(28,20,16,0.45)',
  border: '#e8ddd5',
  shadow: '0 2px 12px rgba(28,20,16,0.08), 0 0 0 1px rgba(28,20,16,0.06)',
  brand: '#f18840',
  income: '#35b5a2',
  danger: '#f43f5e',
  caution: '#f59e0b',
} as const

// ─── 初期状態 ─────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  salaryDay: 25,
  monthlyIncome: 252600,
  fixedCosts: {
    rent: { label: '家賃', icon: Home, value: 85000, step: 1000 },
    utilities: { label: '光熱費', icon: Zap, value: 12000, step: 1000 },
    insurance: { label: '保険料', icon: Heart, value: 8000, step: 500 },
    subscription: { label: 'サブスク', icon: ShoppingBag, value: 5000, step: 500 },
    transport: { label: '交通費', icon: Car, value: 11000, step: 1000 },
    other: { label: 'その他固定費', icon: Wallet, value: 10000, step: 1000 },
  },
  currentBalance: 999853,
}

type FixedKey = keyof typeof INITIAL_STATE.fixedCosts
type State = typeof INITIAL_STATE

// ─── 1日予算の計算 ─────────────────────────────────────────────────────────
function calcDailyBudget(state: State) {
  const totalFixed = Object.values(state.fixedCosts).reduce((a, b) => a + b.value, 0)
  const disposable = state.monthlyIncome - totalFixed
  return Math.max(0, Math.floor(disposable / 30))
}

function calcTotalFixed(state: State) {
  return Object.values(state.fixedCosts).reduce((a, b) => a + b.value, 0)
}

// ─── 数値入力行 ───────────────────────────────────────────────────────────
function NumberRow({
  label,
  icon: Icon,
  value,
  onChange,
  step = 1000,
}: {
  label: string
  icon: React.ElementType
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() {
    setDraft(value.toString())
    setEditing(true)
  }

  function commitEdit() {
    const n = parseInt(draft, 10)
    if (!isNaN(n) && n >= 0) onChange(n)
    else setDraft(value.toString())
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 py-3.5">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: D.bg }}
      >
        <Icon size={16} style={{ color: D.brand }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold mb-0.5" style={{ color: D.muted }}>{label}</div>
        {editing ? (
          <div className="flex items-center gap-1">
            <span className="text-sm" style={{ color: D.muted }}>¥</span>
            <input
              autoFocus
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="w-32 font-bold outline-none border-b-2 bg-transparent tabular-nums"
              style={{ fontSize: '16px', color: D.text, borderColor: D.brand }}
              step={step}
              min={0}
            />
          </div>
        ) : (
          <motion.button
            className="flex items-center gap-1"
            onClick={startEdit}
            whileTap={{ scale: 0.97 }}
            transition={SPRING.SNAP}
          >
            <span className="text-sm font-extrabold tabular-nums" style={{ color: D.text }}>
              ¥{value.toLocaleString('ja-JP')}
            </span>
            <ChevronRight size={12} style={{ color: D.muted }} />
          </motion.button>
        )}
      </div>
    </div>
  )
}

// ─── 給料日ピッカー ───────────────────────────────────────────────────────
const SALARY_DAYS = [1, 5, 10, 15, 20, 21, 25, 28, 31]

function DayPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="py-3.5">
      <div className="text-[11px] font-semibold mb-2.5" style={{ color: D.muted }}>給料日</div>
      <div className="flex flex-wrap gap-2">
        {SALARY_DAYS.map((d) => (
          <motion.button
            key={d}
            className="relative h-10 w-10 rounded-2xl text-sm font-bold"
            style={{
              background: value === d ? D.brand : D.bg,
              color: value === d ? '#fff' : D.text,
              boxShadow: value === d ? `0 4px 12px ${D.brand}40` : 'none',
            }}
            onClick={() => onChange(d)}
            whileTap={{ scale: 0.88 }}
            transition={SPRING.SNAP}
          >
            {d}
          </motion.button>
        ))}
        <div className="self-center text-xs" style={{ color: D.muted }}>日</div>
      </div>
    </div>
  )
}

// ─── セクション ───────────────────────────────────────────────────────────
function Section({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING.SMOOTH, delay }}
    >
      <div className="mb-2 px-1">
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: D.muted }}
        >
          {title}
        </span>
      </div>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: D.card,
          borderColor: D.border,
          boxShadow: D.shadow,
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ─── トースト ─────────────────────────────────────────────────────────────
function Toast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-sm font-bold text-white z-50 whitespace-nowrap"
          style={{ background: D.income, boxShadow: `0 8px 24px ${D.income}50` }}
          initial={{ opacity: 0, y: 20, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.94 }}
          transition={SPRING.SNAP}
        >
          <Check size={16} />
          設定を保存しました
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── メインページ ────────────────────────────────────────────────────────
export function PersonalSettingsPrototype() {
  const [state, setState] = useState<State>(INITIAL_STATE)
  const [saved, setSaved] = useState(false)

  const dailyBudget = calcDailyBudget(state)
  const totalFixed = calcTotalFixed(state)
  const disposable = state.monthlyIncome - totalFixed

  function updateFixed(key: FixedKey, value: number) {
    setState((s) => ({
      ...s,
      fixedCosts: {
        ...s.fixedCosts,
        [key]: { ...s.fixedCosts[key], value },
      },
    }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const budgetColor =
    dailyBudget >= 3000 ? D.income : dailyBudget >= 1000 ? D.caution : D.danger

  return (
    <div className="min-h-screen pb-24" style={{ background: D.bg }}>
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b px-4"
        style={{
          background: `${D.bg}ee`,
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(28,20,16,0.10)',
        }}
      >
        <Link
          to="/"
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: D.brand }}
        >
          <ChevronLeft size={14} />ギャラリー
        </Link>
        <span className="text-sm font-extrabold" style={{ color: D.text }}>個人設定</span>
      </div>

      <div className="mx-auto max-w-md px-4 py-4 space-y-5">

        {/* プレビューカード */}
        <motion.div
          className="relative rounded-3xl overflow-hidden p-5"
          style={{
            background: 'linear-gradient(145deg, #1e1a3a 0%, #2a2354 45%, #1b1635 100%)',
            boxShadow: '0 8px 40px rgba(30,26,58,0.35)',
          }}
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={SPRING.SMOOTH}
        >
          {/* グローオーブ */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 200,
              height: 200,
              top: -70,
              right: -70,
              background: `radial-gradient(circle, ${budgetColor}28 0%, transparent 70%)`,
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.50)' }}>
            1日に使えるお金（設定変更で即時反映）
          </div>
          <motion.div
            className="text-[52px] font-extrabold leading-none tabular-nums mb-1"
            style={{ color: budgetColor }}
            key={dailyBudget}
            initial={{ scale: 0.96, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.QUICK}
          >
            ¥{dailyBudget.toLocaleString('ja-JP')}
          </motion.div>
          <div className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.38)' }}>
            月収 ¥{state.monthlyIncome.toLocaleString()} − 固定費 ¥{totalFixed.toLocaleString()} = 可処分 ¥{disposable.toLocaleString()}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '残高', value: `¥${(state.currentBalance / 10000).toFixed(0)}万` },
              { label: '給料日', value: `毎月${state.salaryDay}日` },
              { label: '固定費', value: `¥${(totalFixed / 10000).toFixed(0)}万` },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="rounded-2xl p-2.5 text-center"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING.BASE, delay: 0.12 + i * 0.05 }}
              >
                <div className="text-[9px] mb-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  {item.label}
                </div>
                <div className="text-xs font-extrabold" style={{ color: '#ffffff' }}>
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 収入設定 */}
        <Section title="収入" delay={0.06}>
          <div className="px-4">
            <DayPicker
              value={state.salaryDay}
              onChange={(v) => setState((s) => ({ ...s, salaryDay: v }))}
            />
          </div>
          <div className="px-4 border-t" style={{ borderColor: D.border }}>
            <NumberRow
              label="月収（手取り）"
              icon={TrendingUp}
              value={state.monthlyIncome}
              onChange={(v) => setState((s) => ({ ...s, monthlyIncome: v }))}
              step={10000}
            />
          </div>
        </Section>

        {/* 固定費設定 */}
        <Section title="固定費" delay={0.10}>
          <div className="px-4">
            {(Object.entries(state.fixedCosts) as [FixedKey, State['fixedCosts'][FixedKey]][]).map(
              ([key, cfg], i, arr) => (
                <div
                  key={key}
                  className={i < arr.length - 1 ? 'border-b' : ''}
                  style={{ borderColor: D.border }}
                >
                  <NumberRow
                    label={cfg.label}
                    icon={cfg.icon}
                    value={cfg.value}
                    onChange={(v) => updateFixed(key, v)}
                    step={cfg.step}
                  />
                </div>
              ),
            )}
          </div>
          {/* 合計行 */}
          <div
            className="flex justify-between items-center px-4 py-3 border-t"
            style={{ background: '#fafaf8', borderColor: D.border }}
          >
            <span className="text-xs font-bold" style={{ color: D.muted }}>合計</span>
            <motion.span
              className="text-sm font-extrabold tabular-nums"
              style={{ color: D.text }}
              key={totalFixed}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={SPRING.QUICK}
            >
              ¥{totalFixed.toLocaleString('ja-JP')}
            </motion.span>
          </div>
        </Section>

        {/* 残高設定 */}
        <Section title="現在の残高" delay={0.14}>
          <div className="px-4">
            <NumberRow
              label="口座残高"
              icon={Wallet}
              value={state.currentBalance}
              onChange={(v) => setState((s) => ({ ...s, currentBalance: v }))}
              step={10000}
            />
          </div>
        </Section>

        {/* 保存ボタン */}
        <motion.button
          className="w-full py-4 rounded-2xl text-sm font-extrabold text-white"
          style={{
            background: D.brand,
            boxShadow: `0 4px 20px ${D.brand}40`,
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          transition={SPRING.SNAP}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          設定を保存する
        </motion.button>

        {/* ナビ */}
        <div className="flex items-center justify-between text-xs" style={{ color: D.muted }}>
          <Link
            to="/onboarding"
            style={{ color: D.brand }}
            className="font-semibold hover:underline"
          >
            ← オンボーディング
          </Link>
          <Link
            to="/home-v4"
            style={{ color: D.brand }}
            className="font-semibold hover:underline"
          >
            V4 ダッシュボードへ →
          </Link>
        </div>
      </div>

      <Toast visible={saved} />
    </div>
  )
}
