/**
 * CategoryInputABPrototype — カテゴリ選択UI A/B/C デザインパターン比較
 *
 * HomeV4 ドロワーのカテゴリ選択を3パターンで比較。
 * - Pattern A: 現行グリッド改（4列、選択時アクティブ強調）
 * - Pattern B: リスト型（縦スクロール、アイコン+ラベル+説明）
 * - Pattern C: スクロールチップ（横スクロール式ピル型）
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBasket, ShoppingBag, Car, Zap, Smile, HeartPulse, Tag, Check,
} from 'lucide-react'

// ─── デザイントークン ────────────────────────────────────────────────────────

const C = {
  bg:         '#f5f3ef',
  card:       '#ffffff',
  text:       '#1c1410',
  muted:      'rgba(28,20,16,0.45)',
  border:     'rgba(28,20,16,0.08)',
  brand:      '#f18840',
  brandLight: '#fff6ee',
  brandDeep:  '#e8622a',
} as const

const SPRING = {
  snap:  { type: 'spring', stiffness: 600, damping: 35 } as const,
  quick: { type: 'spring', stiffness: 400, damping: 30 } as const,
  base:  { type: 'spring', stiffness: 300, damping: 28 } as const,
} as const

// ─── カテゴリ定義 ─────────────────────────────────────────────────────────────

type Category = {
  id: string
  label: string
  icon: React.ElementType
  color: string
  bgLight: string
  desc: string
}

const CATEGORIES: Category[] = [
  { id: 'food',       label: '食費',   icon: ShoppingBasket, color: '#f18840', bgLight: '#fff6ee', desc: 'スーパー・外食・カフェ' },
  { id: 'daily',      label: '日用品', icon: ShoppingBag,    color: '#a855f7', bgLight: '#faf5ff', desc: '洗剤・消耗品など' },
  { id: 'transport',  label: '交通費', icon: Car,            color: '#3b82f6', bgLight: '#eff6ff', desc: '電車・バス・タクシー' },
  { id: 'utilities',  label: '光熱費', icon: Zap,            color: '#eab308', bgLight: '#fefce8', desc: '電気・ガス・水道' },
  { id: 'fun',        label: '娯楽費', icon: Smile,          color: '#ec4899', bgLight: '#fdf2f8', desc: '映画・趣味など' },
  { id: 'medical',    label: '医療費', icon: HeartPulse,     color: '#ef4444', bgLight: '#fef2f2', desc: '病院・薬局など' },
  { id: 'other',      label: 'その他', icon: Tag,            color: '#6b7280', bgLight: '#f9fafb', desc: '分類なし' },
]

// ─── Pattern A — 4列グリッド ─────────────────────────────────────────────────

function PatternA({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold" style={{ color: C.muted }}>カテゴリ</p>
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const active = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              whileTap={{ scale: 0.88 }}
              transition={SPRING.snap}
              className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 text-[11px] font-semibold relative"
              style={{
                background: active ? cat.bgLight : C.card,
                border: `1.5px solid ${active ? cat.color : C.border}`,
                color: active ? cat.color : C.muted,
              }}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING.quick}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full"
                  style={{ background: cat.color }}
                >
                  <Check size={9} className="text-white" strokeWidth={3} />
                </motion.span>
              )}
              <Icon size={18} style={{ color: active ? cat.color : C.muted }} />
              {cat.label}
            </motion.button>
          )
        })}
      </div>
      <div className="mt-3 rounded-xl border p-3 text-xs" style={{ background: '#f9fafb', borderColor: C.border }}>
        <p className="font-bold mb-0.5" style={{ color: C.text }}>Pattern A メリット</p>
        <p style={{ color: C.muted }}>一覧性が高く視認しやすい。アクティブ状態をボーダー+バッジで明示。7カテゴリが全て見える。</p>
        <p className="font-bold mt-1.5 mb-0.5" style={{ color: C.text }}>デメリット</p>
        <p style={{ color: C.muted }}>カテゴリが増えると折り返しが多くなる。4列目が1つだけになると不均衡に見える。</p>
      </div>
    </div>
  )
}

// ─── Pattern B — 縦リスト型 ─────────────────────────────────────────────────

function PatternB({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold" style={{ color: C.muted }}>カテゴリ</p>
      <div className="flex flex-col gap-1.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const active = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              whileTap={{ scale: 0.98 }}
              transition={SPRING.snap}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
              style={{
                background: active ? cat.bgLight : C.card,
                border: `1.5px solid ${active ? cat.color : C.border}`,
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: cat.bgLight }}
              >
                <Icon size={17} style={{ color: cat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-none" style={{ color: active ? cat.color : C.text }}>
                  {cat.label}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: C.muted }}>
                  {cat.desc}
                </p>
              </div>
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING.quick}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: cat.color }}
                >
                  <Check size={11} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      <div className="mt-3 rounded-xl border p-3 text-xs" style={{ background: '#f9fafb', borderColor: C.border }}>
        <p className="font-bold mb-0.5" style={{ color: C.text }}>Pattern B メリット</p>
        <p style={{ color: C.muted }}>説明テキストで用途が明確。タップ領域が広くミスタップしにくい。スクリーンリーダーにも対応しやすい。</p>
        <p className="font-bold mt-1.5 mb-0.5" style={{ color: C.text }}>デメリット</p>
        <p style={{ color: C.muted }}>縦に長くなりドロワーのスクロールが必要。カテゴリを一目で比較しにくい。</p>
      </div>
    </div>
  )
}

// ─── Pattern C — 横スクロールチップ ─────────────────────────────────────────

function PatternC({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold" style={{ color: C.muted }}>カテゴリ</p>
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const active = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              whileTap={{ scale: 0.90 }}
              transition={SPRING.snap}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold"
              style={{
                background: active ? cat.color : C.card,
                border: `1.5px solid ${active ? cat.color : C.border}`,
                color: active ? '#ffffff' : C.muted,
              }}
            >
              <Icon size={13} />
              {cat.label}
            </motion.button>
          )
        })}
      </div>

      {/* 選択中カテゴリの詳細表示 */}
      <AnimatePresence mode="wait">
        {selected && (() => {
          const cat = CATEGORIES.find((c) => c.id === selected)
          if (!cat) return null
          const Icon = cat.icon
          return (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={SPRING.base}
              className="flex items-center gap-2 rounded-xl p-3 mt-1"
              style={{ background: cat.bgLight, border: `1px solid rgba(0,0,0,0.06)` }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: cat.color }}
              >
                <Icon size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: cat.color }}>{cat.label}</p>
                <p className="text-[11px]" style={{ color: C.muted }}>{cat.desc}</p>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      <div className="mt-3 rounded-xl border p-3 text-xs" style={{ background: '#f9fafb', borderColor: C.border }}>
        <p className="font-bold mb-0.5" style={{ color: C.text }}>Pattern C メリット</p>
        <p style={{ color: C.muted }}>縦スペースを節約。ドロワー全体がコンパクトになり金額入力との距離が縮まる。横スクロールは直感的。</p>
        <p className="font-bold mt-1.5 mb-0.5" style={{ color: C.text }}>デメリット</p>
        <p style={{ color: C.muted }}>右端のカテゴリが見切れる。カテゴリが多いと全体が見えないため発見しにくい。</p>
      </div>
    </div>
  )
}

// ─── パターン選択タブ ────────────────────────────────────────────────────────

type PatternId = 'A' | 'B' | 'C'

// ─── メイン ──────────────────────────────────────────────────────────────────

export function CategoryInputABPrototype() {
  const [pattern, setPattern] = useState<PatternId>('A')
  const [selectedA, setSelectedA] = useState('food')
  const [selectedB, setSelectedB] = useState('food')
  const [selectedC, setSelectedC] = useState('food')

  const PATTERNS: { id: PatternId; label: string }[] = [
    { id: 'A', label: 'A: グリッド' },
    { id: 'B', label: 'B: リスト' },
    { id: 'C', label: 'C: チップ' },
  ]

  return (
    <div className="min-h-screen pb-10" style={{ background: C.bg }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{
          background: 'rgba(245,243,239,0.92)',
          backdropFilter: 'blur(12px)',
          borderColor: C.border,
        }}
      >
        <h1 className="text-base font-extrabold" style={{ color: C.text }}>
          カテゴリ選択 A/B/C 比較
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
          HomeV4 ドロワー内のカテゴリ選択UI — 3パターン
        </p>
      </header>

      {/* パターン切り替えタブ */}
      <div className="sticky top-[56px] z-10 flex gap-1 px-4 py-2 border-b" style={{ background: C.bg, borderColor: C.border }}>
        {PATTERNS.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setPattern(p.id)}
            whileTap={{ scale: 0.95 }}
            transition={SPRING.snap}
            className="flex-1 rounded-xl py-2 text-[13px] font-bold"
            style={{
              background: pattern === p.id ? C.brand : C.card,
              color: pattern === p.id ? '#fff' : C.muted,
              border: `1.5px solid ${pattern === p.id ? C.brand : C.border}`,
            }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* ドロワーイメージ */}
      <div className="mx-auto max-w-sm px-4 pt-4">
        {/* 金額入力モック */}
        <div
          className="rounded-2xl border p-4 mb-4"
          style={{ background: C.card, borderColor: C.border }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: C.muted }}>支出金額</p>
          <p className="text-3xl font-extrabold tabular-nums" style={{ color: C.brand }}>¥1,280</p>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>記録後の残り: ¥5,123</p>
        </div>

        {/* カテゴリ選択パターン */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pattern}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING.base}
          >
            {pattern === 'A' && <PatternA selected={selectedA} onSelect={setSelectedA} />}
            {pattern === 'B' && <PatternB selected={selectedB} onSelect={setSelectedB} />}
            {pattern === 'C' && <PatternC selected={selectedC} onSelect={setSelectedC} />}
          </motion.div>
        </AnimatePresence>

        {/* メモ入力モック */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="メモ（店名・用途など、任意）"
            readOnly
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{
              fontSize: '16px',
              background: C.card,
              borderColor: C.border,
              color: C.text,
            }}
          />
        </div>

        {/* 登録ボタンモック */}
        <button
          type="button"
          className="mt-4 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white"
          style={{ background: `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})` }}
        >
          記録する
        </button>
      </div>
    </div>
  )
}
