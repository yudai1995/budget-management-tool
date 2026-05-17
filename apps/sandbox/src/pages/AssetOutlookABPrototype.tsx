/* eslint-disable react-refresh/only-export-components */
/**
 * AssetOutlookABPrototype — 長期指標 リッチデザイン（Sprint #18）
 *
 * - タブ廃止 → ドットインジケーター + スワイプ切り替え
 * - ヒーローカード配色をブランドカラー（ウォームダークブラウン × オレンジ / ティール）に統一
 *
 * Pattern A: 資産ランウェイ
 * Pattern B: 今月の貯蓄額（先月比付き）
 * Pattern C: 年間貯蓄ペース予測
 * Pattern D: 財政健全スコア（複合指標）
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring as useMotionSpring,
  type PanInfo,
} from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wallet,
  PiggyBank,
} from 'lucide-react'

// ─── Spring プリセット ───────────────────────────────────────────────────
export const SPRING = {
  SNAP:   { type: 'spring', stiffness: 600, damping: 35 },
  QUICK:  { type: 'spring', stiffness: 400, damping: 30 },
  BASE:   { type: 'spring', stiffness: 300, damping: 28 },
  SMOOTH: { type: 'spring', stiffness: 200, damping: 26 },
} as const

// ─── デザイントークン ─────────────────────────────────────────────────────
export const D = {
  bg:         '#fffdf5',
  card:       '#ffffff',
  text:       '#1c1410',
  muted:      'rgba(28,20,16,0.45)',
  mutedLight: 'rgba(28,20,16,0.22)',
  border:     'rgba(28,20,16,0.08)',
  borderMid:  'rgba(28,20,16,0.12)',
  shadow:     '0 2px 12px rgba(28,20,16,0.08), 0 0 0 1px rgba(28,20,16,0.06)',
  shadowMd:   '0 4px 24px rgba(28,20,16,0.10)',
  brand:      '#f18840',
  brandDeep:  '#d4601e',
  income:     '#35b5a2',
  incomeDeep: '#1d9181',
  danger:     '#f43f5e',
  // ヒーローカード — ライトパレット（白カード）
  heroBg:    '#ffffff',
  heroText:  '#1c1410',
  heroMuted: 'rgba(28,20,16,0.45)',
  heroCard:  'rgba(28,20,16,0.04)',
  heroCardBorder: 'rgba(28,20,16,0.08)',
} as const

// ─── モックデータ ────────────────────────────────────────────────────────
const MOCK = {
  totalAssets:      999853,
  monthlyIncome:    252600,
  thisMonthExpense: 148700,
  thisMonthIncome:  252600,
  lastMonthExpense: 136300,
  lastMonthIncome:  252600,
  netDailyExpense:  9800 - 252600 / 30,
  recordedMonths:   4,
  // サマリー用
  dailyBudget:      8420,
  todayExpense:     2480,
}
const dailyRemaining  = Math.max(0, MOCK.dailyBudget - MOCK.todayExpense)  // 5,940
const monthNet        = MOCK.thisMonthIncome - MOCK.thisMonthExpense        // 103,900

const thisMonthSavings  = MOCK.thisMonthIncome - MOCK.thisMonthExpense       // 103,900
const lastMonthSavings  = MOCK.lastMonthIncome - MOCK.lastMonthExpense       // 116,300
const savingsDiff       = thisMonthSavings - lastMonthSavings                // −12,400
const annualSavingsPace = thisMonthSavings * 12                              // 1,246,800
const savingsRate       = Math.round((thisMonthSavings / MOCK.thisMonthIncome) * 100)
const assetRunwayDays   = Math.floor(MOCK.totalAssets / MOCK.netDailyExpense)
const assetRunwayDate   = (() => {
  const d = new Date(2026, 4, 15)
  d.setDate(d.getDate() + assetRunwayDays)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})()

function yen(n: number) { return `¥${Math.round(n).toLocaleString('ja-JP')}` }

// ─── パターン定義 ─────────────────────────────────────────────────────────
export type PatternId = 'A' | 'B' | 'C'
export const PATTERNS: PatternId[] = ['A', 'B', 'C']

// ブランドカラーに準じたアクセント割り当て
export const PATTERN_META: Record<PatternId, { name: string; accent: string }> = {
  A: { name: '資産ランウェイ', accent: D.brand  },   // ブランドオレンジ
  B: { name: '今月の貯蓄額',   accent: D.income },   // ブランドティール
  C: { name: '年間ペース予測', accent: D.brand  },   // ブランドオレンジ
}

// ─── コンテンツスライドアニメーション ─────────────────────────────────────
// direction > 0 = 次へ（左スワイプ）, direction < 0 = 前へ（右スワイプ）
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 56 : -56,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: SPRING.BASE,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -56 : 56,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.12 },
  }),
}

// ─── SpringNumber ─────────────────────────────────────────────────────────
function SpringNumber({
  value,
  format = (v: number) => v.toLocaleString('ja-JP'),
}: {
  value: number
  format?: (v: number) => string
}) {
  const mv = useMotionValue(0)
  const spring = useMotionSpring(mv, { stiffness: 260, damping: 28 })
  const display = useTransform(spring, (v) => format(Math.round(v)))
  useEffect(() => { mv.set(value) }, [mv, value])
  return <motion.span>{display}</motion.span>
}

// ─── ProgressBar ──────────────────────────────────────────────────────────
function ProgressBar({
  pct,
  color,
  height = 6,
  delay = 0,
}: {
  pct: number
  color: string
  height?: number
  delay?: number
}) {
  return (
    <div
      className="overflow-hidden"
      style={{ height, borderRadius: 9999, background: D.heroCard }}
    >
      <motion.div
        className="h-full"
        style={{ borderRadius: 9999, background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ type: 'spring', stiffness: 260, damping: 28, delay }}
      />
    </div>
  )
}

// ─── スタッガーアイテム ───────────────────────────────────────────────────
const staggerItem = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { ...SPRING.BASE, delay: 0.1 + i * 0.05 },
})

// ─── サマリー行（全パターン共通: 今日使えるお金 + 今月の収支）─────────────
export function SummaryRow() {
  const isPositive = monthNet >= 0
  return (
    <motion.div
      className="grid grid-cols-2 gap-2 w-full max-w-xs mx-auto mb-4"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING.QUICK, delay: 0.05 }}
    >
      <div
        className="flex items-center gap-2 rounded-2xl px-3 py-2"
        style={{ background: D.heroCard, border: `1px solid ${D.heroCardBorder}` }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${D.brand}1a`, color: D.brand }}
        >
          <Wallet size={13} />
        </div>
        <div className="text-left leading-tight min-w-0">
          <div className="text-[9px] font-semibold truncate" style={{ color: D.heroMuted }}>今日使えるお金</div>
          <div className="text-[13px] font-extrabold tabular-nums" style={{ color: D.heroText, letterSpacing: '-0.01em' }}>
            ¥{dailyRemaining.toLocaleString('ja-JP')}
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-2 rounded-2xl px-3 py-2"
        style={{ background: D.heroCard, border: `1px solid ${D.heroCardBorder}` }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: isPositive ? `${D.income}1a` : `${D.danger}1a`,
            color: isPositive ? D.income : D.danger,
          }}
        >
          <PiggyBank size={13} />
        </div>
        <div className="text-left leading-tight min-w-0">
          <div className="text-[9px] font-semibold truncate" style={{ color: D.heroMuted }}>今月の収支</div>
          <div
            className="text-[13px] font-extrabold tabular-nums"
            style={{ color: isPositive ? D.income : D.danger, letterSpacing: '-0.01em' }}
          >
            {isPositive ? '+' : '−'}¥{Math.abs(monthNet).toLocaleString('ja-JP')}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Pattern A ───────────────────────────────────────────────────────────
export function PatternAHero({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <SummaryRow />
      <div className="text-xs font-semibold mb-2" style={{ color: D.heroMuted }}>
        今のペースで資産が尽きる時期
      </div>
      <div className="text-[44px] font-extrabold leading-none mb-2" style={{ color: D.heroText }}>
        {assetRunwayDate}
      </div>
      <div className="text-sm font-semibold" style={{ color: accent }}>
        残り約 <SpringNumber value={Math.round(assetRunwayDays / 30)} /> ヶ月
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-xs">
        {[
          { label: '総資産',    value: yen(MOCK.totalAssets) },
          { label: '純日次支出', value: yen(Math.round(MOCK.netDailyExpense)) },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="rounded-2xl p-3 text-center"
            style={{ background: D.heroCard, border: `1px solid ${D.heroCardBorder}` }}
            {...staggerItem(i)}
          >
            <div className="text-[10px] mb-1" style={{ color: D.heroMuted }}>{item.label}</div>
            <div className="text-sm font-extrabold tabular-nums" style={{ color: D.heroText }}>{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Pattern B ───────────────────────────────────────────────────────────
export function PatternBHero({ accent }: { accent: string }) {
  const isPositive = savingsDiff >= 0
  return (
    <div className="flex flex-col items-center text-center">
      <SummaryRow />
      <div className="text-xs font-semibold mb-2" style={{ color: D.heroMuted }}>今月の貯蓄</div>
      <div className="text-[52px] font-extrabold leading-none tabular-nums mb-3" style={{ color: D.heroText }}>
        ¥<SpringNumber value={thisMonthSavings} />
      </div>
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
        style={{
          background: isPositive ? 'rgba(53,181,162,0.16)' : 'rgba(244,63,94,0.16)',
          color: isPositive ? accent : '#f87171',
        }}
      >
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        先月比 {isPositive ? '+' : '−'}¥{Math.abs(savingsDiff).toLocaleString('ja-JP')}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 w-full max-w-xs">
        {[
          { label: '月収',      value: yen(MOCK.thisMonthIncome),  color: accent },
          { label: '今月支出',  value: yen(MOCK.thisMonthExpense), color: '#f87171' },
          { label: '貯蓄率',    value: `${savingsRate}%`,          color: accent },
          { label: '先月の貯蓄', value: yen(lastMonthSavings),     color: D.heroMuted },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="rounded-2xl p-3 text-center"
            style={{ background: D.heroCard, border: `1px solid ${D.heroCardBorder}` }}
            {...staggerItem(i)}
          >
            <div className="text-[10px] mb-1" style={{ color: D.heroMuted }}>{item.label}</div>
            <div className="text-sm font-extrabold tabular-nums" style={{ color: item.color }}>{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Pattern C ───────────────────────────────────────────────────────────
export function PatternCHero({ accent }: { accent: string }) {
  const annualTarget = 1500000
  const progressPct  = Math.min(100, Math.round((annualSavingsPace / annualTarget) * 100))
  return (
    <div className="flex flex-col items-center text-center">
      <SummaryRow />
      <div className="text-xs font-semibold mb-2" style={{ color: D.heroMuted }}>このペースで年間</div>
      <div className="text-[44px] font-extrabold leading-none tabular-nums mb-1" style={{ color: D.heroText }}>
        ¥<SpringNumber value={annualSavingsPace} />
      </div>
      <div className="text-sm mb-5" style={{ color: D.heroMuted }}>貯蓄できます</div>
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: D.heroMuted }}>年間目標 {yen(annualTarget)}</span>
          <span className="font-bold" style={{ color: accent }}>{progressPct}%</span>
        </div>
        <ProgressBar pct={progressPct} color={accent} height={8} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-xs">
        {[
          { label: '今月の貯蓄', value: yen(thisMonthSavings) },
          { label: '貯蓄率',    value: `${savingsRate}%` },
          { label: '目標達成率', value: `${progressPct}%` },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="rounded-2xl p-2.5 text-center"
            style={{ background: D.heroCard, border: `1px solid ${D.heroCardBorder}` }}
            {...staggerItem(i)}
          >
            <div className="text-[9px] mb-0.5" style={{ color: D.heroMuted }}>{item.label}</div>
            <div className="text-xs font-extrabold tabular-nums" style={{ color: D.heroText }}>{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Meta アコーディオン ──────────────────────────────────────────────────
export function MetaAccordion({
  pros, cons, data, warning,
}: {
  pros: string[]; cons: string[]; data: string[]; warning?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <motion.button
        className="w-full flex items-center justify-between py-3 text-sm font-semibold"
        style={{ color: D.muted }}
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        transition={SPRING.SNAP}
      >
        <span>詳細情報・比較メモ</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING.QUICK}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-3 space-y-3 border-t" style={{ borderColor: D.border }}>
              {warning && (
                <div
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
                  style={{ background: '#fff8f0', border: `1px solid ${D.brand}30`, color: D.text + 'cc' }}
                >
                  <AlertTriangle size={12} style={{ color: D.brand, flexShrink: 0, marginTop: 1 }} />
                  {warning}
                </div>
              )}
              <div>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: D.muted }}>
                  得られる情報
                </div>
                <ul className="space-y-1">
                  {data.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: D.text + 'cc' }}>
                      <span style={{ color: D.income, flexShrink: 0 }}>•</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-[10px] font-bold" style={{ color: D.income }}>メリット</div>
                  <ul className="space-y-0.5">
                    {pros.map((p, i) => <li key={i} className="text-xs" style={{ color: D.text + 'bb' }}>✓ {p}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-bold" style={{ color: D.danger }}>デメリット</div>
                  <ul className="space-y-0.5">
                    {cons.map((c, i) => <li key={i} className="text-xs" style={{ color: D.text + 'bb' }}>✗ {c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const PATTERN_DETAILS: Record<PatternId, { pros: string[]; cons: string[]; data: string[]; warning?: string }> = {
  A: {
    data: ['今の純支出ペースが続いた場合の資産枯渇時期', '総資産 ÷ (平均日次支出 − 月収÷30) で算出', '資産が「減っているか」の長期サイン'],
    pros: ['長期的な危機感を持てる', '資産と支出の関係が可視化される'],
    cons: ['定収入があると ∞ になりやすい', '「尽きる」という表現がネガティブ', '月収変動で大きくブレる'],
    warning: '定収入がある人は純日次支出がほぼ 0 になり「∞」表示になりやすい。その場合この指標は無意味。',
  },
  B: {
    data: ['今月の貯蓄額（収入 − 支出）', '先月比の貯蓄差額', '貯蓄率（手取りの何%を貯めているか）'],
    pros: ['誰にでも直感的に理解できる', '毎月更新される達成感がある', '定収入の人にも有意義'],
    cons: ['月中だと確定値ではなく予測', '長期的な視点がない', '先月データが必要'],
  },
  C: {
    data: ['今月のペースで年換算した貯蓄額', '年間目標との達成率', '貯蓄率（手取りに対する比率）'],
    pros: ['前向きな目標感が生まれる', '「年間○○万貯める」という計画に使える'],
    cons: ['1 ヶ月データで年換算するのは精度が低い', '目標設定が必要（オンボーディング負荷）', 'ボーナス月などで大きくブレる'],
    warning: '今月の貯蓄が少ない月に見ると不安になりやすい。直近 3〜6 ヶ月平均の方が安定する。',
  },
}

// ─── メインページ ────────────────────────────────────────────────────────
export function AssetOutlookABPrototype() {
  const [active, setActive]     = useState<PatternId>('A')
  const [direction, setDirection] = useState(0) // 正 = 次へ（左スワイプ）、負 = 前へ
  const [hintPlayed, setHintPlayed] = useState(false) // 初回スワイプヒント再生済み

  const activeIdx = PATTERNS.indexOf(active)
  const accent    = PATTERN_META[active].accent

  function goToIdx(nextIdx: number) {
    if (nextIdx < 0 || nextIdx >= PATTERNS.length) return
    setDirection(nextIdx > activeIdx ? 1 : -1)
    setActive(PATTERNS[nextIdx])
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = 40
    if (info.offset.x < -threshold) goToIdx(activeIdx + 1)
    else if (info.offset.x > threshold) goToIdx(activeIdx - 1)
  }

  // パターンコンポーネントのマッピング
  const heroMap: Record<PatternId, React.ReactNode> = {
    A: <PatternAHero accent={accent} />,
    B: <PatternBHero accent={accent} />,
    C: <PatternCHero accent={accent} />,
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: D.bg }}>
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b px-4"
        style={{ background: `${D.bg}ee`, backdropFilter: 'blur(12px)', borderColor: 'rgba(28,20,16,0.10)' }}
      >
        <Link to="/" className="flex items-center gap-1 text-xs font-semibold" style={{ color: D.brand }}>
          <ChevronLeft size={14} />ギャラリー
        </Link>
        <span className="text-sm font-extrabold" style={{ color: D.text }}>
          長期指標 — A/B 比較
        </span>
      </div>

      <div className="mx-auto max-w-md px-4 py-4">

        {/* ヒーローカード */}
        <motion.div
          className="relative rounded-3xl overflow-hidden mb-4"
          style={{ background: D.heroBg, boxShadow: D.shadowMd, border: `1px solid ${D.border}` }}
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={SPRING.SMOOTH}
          role="region"
          aria-roledescription="カルーセル"
          aria-label="長期指標パターン比較"
        >
          {/* グローオーブ */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 220,
              height: 220,
              top: -80,
              right: -70,
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* スワイプ領域 + サイド矢印ボタン */}
          <div className="relative">
            {/* 左矢印 */}
            <motion.button
              type="button"
              onClick={() => goToIdx(activeIdx - 1)}
              disabled={activeIdx === 0}
              whileTap={{ scale: 0.88 }}
              transition={SPRING.SNAP}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-25 disabled:cursor-not-allowed transition-opacity hover:opacity-100"
              style={{
                background:  D.heroCard,
                border:      `1px solid ${D.heroCardBorder}`,
                color:       D.text,
                opacity:     activeIdx === 0 ? 0.25 : 0.85,
                backdropFilter: 'blur(4px)',
              }}
              aria-label="前のパターン"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </motion.button>

            {/* 右矢印 */}
            <motion.button
              type="button"
              onClick={() => goToIdx(activeIdx + 1)}
              disabled={activeIdx === PATTERNS.length - 1}
              whileTap={{ scale: 0.88 }}
              transition={SPRING.SNAP}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-25 disabled:cursor-not-allowed transition-opacity hover:opacity-100"
              style={{
                background:  D.heroCard,
                border:      `1px solid ${D.heroCardBorder}`,
                color:       D.text,
                opacity:     activeIdx === PATTERNS.length - 1 ? 0.25 : 0.85,
                backdropFilter: 'blur(4px)',
              }}
              aria-label="次のパターン"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </motion.button>

            {/* スワイプ可能なコンテンツ領域 */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.06}
              onDragEnd={handleDragEnd}
              className="px-12 pt-5 pb-4 select-none"
              style={{ touchAction: 'pan-y', cursor: 'grab' }}
              whileDrag={{ cursor: 'grabbing' }}
              // 初回マウント時に微小なウィグルでスワイプ可能性を伝える
              animate={hintPlayed ? {} : { x: [0, -10, 6, 0] }}
              transition={hintPlayed ? {} : { duration: 0.9, delay: 0.4, ease: 'easeInOut' }}
              onAnimationComplete={() => setHintPlayed(true)}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={active}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  role="group"
                  aria-roledescription="スライド"
                  aria-label={`${activeIdx + 1} / ${PATTERNS.length}: ${PATTERN_META[active].name}`}
                  aria-live="polite"
                >
                  {heroMap[active]}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ボトムインジケーター: ドット + アクティブラベル */}
          <div className="flex flex-col items-center gap-2 pb-4 px-4">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="パターン選択">
              {PATTERNS.map((id, i) => {
                const isActive = active === id;
                const itemAccent = PATTERN_META[id].accent;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => goToIdx(i)}
                    whileTap={{ scale: 0.85 }}
                    transition={SPRING.SNAP}
                    aria-label={`Pattern ${id}: ${PATTERN_META[id].name}`}
                    aria-current={isActive ? 'true' : undefined}
                    role="tab"
                    style={{
                      height:       7,
                      width:        isActive ? 28 : 7,
                      borderRadius: 9999,
                      background:   isActive ? itemAccent : 'rgba(28,20,16,0.18)',
                      transition:   'width 0.22s ease-out, background 0.2s',
                    }}
                  />
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`label-${active}`}
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                Pattern {active} — {PATTERN_META[active].name}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 詳細カード */}
        <motion.div
          className="rounded-2xl border px-4"
          style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.SMOOTH, delay: 0.08 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`meta-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MetaAccordion {...PATTERN_DETAILS[active]} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 比較サマリー */}
        <motion.div
          className="mt-4 rounded-2xl border overflow-hidden"
          style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.SMOOTH, delay: 0.14 }}
        >
          <div className="px-4 pt-4 pb-2">
            <div className="text-sm font-extrabold" style={{ color: D.text }}>パターン比較</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                  {['', 'A: ランウェイ', 'B: 貯蓄額', 'C: 年間ペース'].map((h) => (
                    <th key={h} className="py-2 px-3 text-left font-bold whitespace-nowrap" style={{ color: D.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '対象',      vals: ['資産取り崩し中', '定収入・貯蓄', '年間目標あり'] },
                  { label: '直感的さ',  vals: ['△', '◎', '○'] },
                  { label: '実装コスト', vals: ['中', '低', '低〜中'] },
                ].map((row) => (
                  <tr key={row.label} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td className="py-2 px-3 font-semibold whitespace-nowrap" style={{ color: D.muted }}>{row.label}</td>
                    {row.vals.map((v, i) => (
                      <td
                        key={i}
                        className="py-2 px-3 whitespace-nowrap"
                        style={{
                          color: D.text,
                          fontWeight: (PATTERNS[i]) === active ? 700 : 400,
                        }}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ナビ */}
        <div className="mt-6 flex items-center justify-between text-xs" style={{ color: D.muted }}>
          <Link to="/category-ab" style={{ color: D.brand }} className="font-semibold hover:underline">
            ← カテゴリ TOP A/B
          </Link>
          <Link to="/home" style={{ color: D.brand }} className="font-semibold hover:underline">
            ホームへ →
          </Link>
        </div>
      </div>
    </div>
  )
}
