/**
 * TodayStatusPalettePrototype — 今日の状況 カラーパレット比較
 *
 * todaySpendPct（日予算消化率）に応じた4状態のカラー・UI を横並び比較。
 * - 好調:  ≤ 50%   → バッジ緑 / バー緑
 * - 順調:  51〜80% → バッジ緑 / バー緑
 * - 注意:  81〜100%→ バッジ・バーともにピンク（#e879a3）
 * - 超過:  > 100%  → バッジ・バーともに赤（#f43f5e）
 */

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react'

// ── デザイントークン ──────────────────────────────────────────────────────────
const D = {
  bg:     '#fffdf5',
  card:   '#ffffff',
  text:   '#1c1410',
  muted:  'rgba(28,20,16,0.42)',
  border: 'rgba(28,20,16,0.08)',
  shadow: '0 1px 3px rgba(28,20,16,0.06), 0 0 0 1px rgba(28,20,16,0.06)',
  brand:  '#f18840',
} as const

// ── 4状態のパレット定義 ──────────────────────────────────────────────────────
// 共通モック: 日予算 ¥7,692
const PALETTES = [
  {
    key:           'great',
    label:         '好調',
    range:         '消化率 ≤ 50%',
    description:   '日予算の半分以下。今日は節約できている状態',
    badgeBg:       'rgba(53,181,162,0.12)',
    badgeColor:    '#35b5a2',
    badgeLabel:    '好調',
    barGradient:   'linear-gradient(90deg, #34d399, #35b5a2)',
    spendPct:      16,   // ¥1,200 / ¥7,692
    expenseLabel:  '¥1,200',
    budgetLabel:   '¥7,692',
    InsightIcon:   Sparkles,
    insightBg:     '#fff6ee',
    insightColor:  '#f18840',
    insightMsg:    '今日この調子なら目標 +148% 達成見込み！',
    // カラートークン
    badgeColorKey: '#35b5a2（緑）',
    barColorKey:   '#35b5a2（緑）',
    noteColor:     '#35b5a2',
  },
  {
    key:           'steady',
    label:         '順調',
    range:         '消化率 51〜80%',
    description:   '日予算の80%以内。ペースは問題なし',
    badgeBg:       'rgba(53,181,162,0.12)',
    badgeColor:    '#35b5a2',
    badgeLabel:    '順調',
    barGradient:   'linear-gradient(90deg, #34d399, #35b5a2)',
    spendPct:      68,   // ¥5,200 / ¥7,692
    expenseLabel:  '¥5,200',
    budgetLabel:   '¥7,692',
    InsightIcon:   TrendingUp,
    insightBg:     '#ecfaf8',
    insightColor:  '#35b5a2',
    insightMsg:    'このペースなら今月の貯蓄目標達成見込み',
    badgeColorKey: '#35b5a2（緑）',
    barColorKey:   '#35b5a2（緑）',
    noteColor:     '#35b5a2',
  },
  {
    key:           'caution',
    label:         '注意',
    range:         '消化率 81〜100%',
    description:   '日予算ギリギリ。バッジ・バーともにピンクで統一',
    badgeBg:       'rgba(232,121,163,0.12)',
    badgeColor:    '#e879a3',
    badgeLabel:    '注意',
    barGradient:   'linear-gradient(90deg, #f9a8d4, #e879a3)',
    spendPct:      88,   // ¥6,800 / ¥7,692
    expenseLabel:  '¥6,800',
    budgetLabel:   '¥7,692',
    InsightIcon:   AlertTriangle,
    insightBg:     'rgba(232,121,163,0.08)',
    insightColor:  '#e879a3',
    insightMsg:    'あと少し節約すると目標達成できそう',
    badgeColorKey: '#e879a3（ピンク）',
    barColorKey:   '#e879a3（ピンク）',
    noteColor:     '#e879a3',
  },
  {
    key:           'over',
    label:         '超過',
    range:         '消化率 > 100%',
    description:   '日予算を超過。支出が多い日の最終状態',
    badgeBg:       'rgba(244,63,94,0.09)',
    badgeColor:    '#f43f5e',
    badgeLabel:    '超過',
    barGradient:   'linear-gradient(90deg, #fb7185, #f43f5e)',
    spendPct:      100,  // 120%だが表示上100%でキャップ
    expenseLabel:  '¥9,200',
    budgetLabel:   '¥7,692',
    InsightIcon:   AlertCircle,
    insightBg:     'rgba(244,63,94,0.08)',
    insightColor:  '#f43f5e',
    insightMsg:    'このペースだと今月赤字になりそう',
    badgeColorKey: '#f43f5e（赤）',
    barColorKey:   '#f43f5e（赤）',
    noteColor:     '#f43f5e',
  },
] as const

// ── 共通ProgressBar ──────────────────────────────────────────────────────────
function Bar({ pct, gradient, delay = 0 }: { pct: number; gradient: string; delay?: number }) {
  return (
    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(28,20,16,0.06)' }}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 70, damping: 18, delay }}
        style={{ background: gradient }}
      />
    </div>
  )
}

// ── パレットカード ─────────────────────────────────────────────────────────
function PaletteCard({ p, delay }: { p: typeof PALETTES[number]; delay: number }) {
  const { InsightIcon } = p
  return (
    <div className="flex flex-col gap-3">
      {/* パレットラベル */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: p.noteColor }}>
          {p.label}
        </div>
        <div className="text-[10px] font-semibold mb-0.5" style={{ color: D.muted }}>{p.range}</div>
        <div className="text-[9px]" style={{ color: 'rgba(28,20,16,0.35)' }}>{p.description}</div>
      </div>

      {/* 今日の状況カード */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: D.shadow }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold" style={{ color: D.text }}>今日の状況</span>
          <span
            className="px-2.5 py-0.5 text-[10px] font-bold"
            style={{ borderRadius: '9999px', background: p.badgeBg, color: p.badgeColor }}
          >
            {p.badgeLabel}
          </span>
        </div>

        {/* 支出 / 日予算 */}
        <div>
          <div className="flex justify-between text-[10px] mb-1.5" style={{ color: D.muted }}>
            <span>今日の支出</span>
            <span className="tabular-nums font-semibold">
              {p.expenseLabel} / {p.budgetLabel}
            </span>
          </div>
          <Bar pct={p.spendPct} gradient={p.barGradient} delay={delay + 0.2} />
          <div className="mt-1 text-right text-[10px] tabular-nums" style={{ color: 'rgba(28,20,16,0.28)' }}>
            {p.spendPct === 100 ? '120%（超過）' : `${p.spendPct}%`}
          </div>
        </div>

        {/* 貯蓄インサイト */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: p.insightBg }}
        >
          <InsightIcon size={12} style={{ color: p.insightColor, flexShrink: 0 }} />
          <span className="text-[10px] font-semibold leading-tight" style={{ color: p.insightColor }}>
            {p.insightMsg}
          </span>
        </div>
      </div>

      {/* カラートークン */}
      <div
        className="rounded-xl p-3"
        style={{ background: D.card, border: `1px solid ${D.border}` }}
      >
        <div className="text-[10px] font-bold mb-2" style={{ color: D.muted }}>カラートークン</div>
        <div className="flex flex-col gap-2">
          {/* バッジ */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full shrink-0" style={{ background: p.badgeColor }} />
            <span className="text-[10px] font-semibold" style={{ color: D.text }}>バッジ</span>
            <span className="ml-auto text-[9px] font-mono" style={{ color: D.muted }}>{p.badgeColorKey}</span>
          </div>
          {/* バー */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded shrink-0" style={{ background: p.barGradient }} />
            <span className="text-[10px] font-semibold" style={{ color: D.text }}>バー</span>
            <span className="ml-auto text-[9px] font-mono" style={{ color: D.muted }}>{p.barColorKey}</span>
          </div>
          {/* インサイト */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded shrink-0" style={{ background: p.insightBg, border: `1px solid ${p.noteColor}30` }} />
            <span className="text-[10px] font-semibold" style={{ color: D.text }}>インサイト背景</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function TodayStatusPalettePrototype() {
  return (
    <div className="min-h-screen pb-16" style={{ background: D.bg }}>
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{ background: 'rgba(255,253,245,0.92)', backdropFilter: 'blur(12px)', borderColor: D.border }}
      >
        <h1 className="text-[15px] font-extrabold" style={{ color: D.text }}>
          今日の状況 — カラーパレット比較
        </h1>
        <p className="text-[11px] mt-0.5" style={{ color: D.muted }}>
          日予算消化率に応じた4状態（好調 / 順調 / 注意 / 超過）を横並び比較
        </p>
      </div>

      {/* 凡例バー */}
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-2">
        <div className="flex items-center gap-4 flex-wrap">
          {PALETTES.map(p => (
            <span key={p.key} className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="h-3 w-3 rounded-full inline-block" style={{ background: p.badgeColor }} />
              {p.label}
              <span className="font-normal text-[10px]" style={{ color: D.muted }}>（{p.range}）</span>
            </span>
          ))}
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,121,163,0.10)', color: '#e879a3' }}>
            ※ 注意はバッジ・バーともにピンクで統一
          </span>
        </div>
      </div>

      {/* 4カラム比較 */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PALETTES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.07 }}
            >
              <PaletteCard p={p} delay={i * 0.07} />
            </motion.div>
          ))}
        </div>

        {/* 適用箇所・閾値テーブル */}
        <div
          className="mt-8 rounded-2xl border overflow-hidden"
          style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
        >
          <div className="px-5 py-3 border-b" style={{ borderColor: D.border, background: 'rgba(28,20,16,0.02)' }}>
            <span className="text-[12px] font-bold" style={{ color: D.text }}>適用箇所と閾値</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                  {[
                    'コンポーネント',
                    '好調（緑）≤ 50%',
                    '順調（緑）51〜80%',
                    '注意（ピンク）81〜100%',
                    '超過（赤）> 100%',
                  ].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: D.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    comp: 'バッジ色',
                    great:   '緑 #35b5a2',
                    steady:  '緑 #35b5a2',
                    caution: 'ピンク #e879a3',
                    over:    '赤 #f43f5e',
                  },
                  {
                    comp: 'バー色',
                    great:   '緑グラデ',
                    steady:  '緑グラデ',
                    caution: 'ピンク #e879a3',
                    over:    '赤グラデ',
                  },
                  {
                    comp: 'インサイト アイコン',
                    great:   'Sparkles',
                    steady:  'TrendingUp',
                    caution: 'AlertTriangle',
                    over:    'AlertCircle',
                  },
                  {
                    comp: 'インサイト メッセージ',
                    great:   '目標 +XX% 達成見込み！',
                    steady:  'このペースなら目標達成見込み',
                    caution: 'あと少し節約すると達成できそう',
                    over:    'このペースだと赤字になりそう',
                  },
                  {
                    comp: 'インサイト 色',
                    great:   'オレンジ（ブランド）',
                    steady:  '緑 #35b5a2',
                    caution: 'ピンク #e879a3',
                    over:    '赤 #f43f5e',
                  },
                ].map(row => (
                  <tr key={row.comp} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: D.text }}>{row.comp}</td>
                    <td className="px-4 py-2.5" style={{ color: '#35b5a2' }}>{row.great}</td>
                    <td className="px-4 py-2.5" style={{ color: '#35b5a2' }}>{row.steady}</td>
                    <td className="px-4 py-2.5" style={{ color: '#e879a3' }}>{row.caution}</td>
                    <td className="px-4 py-2.5" style={{ color: '#f43f5e' }}>{row.over}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 設計メモ */}
        <div
          className="mt-4 rounded-xl p-4 text-[11px]"
          style={{ background: 'rgba(232,121,163,0.06)', border: '1px solid rgba(232,121,163,0.18)' }}
        >
          <p className="font-bold mb-1" style={{ color: '#e879a3' }}>注意ステータスのカラー設計</p>
          <p style={{ color: D.muted }}>
            バッジ・バーともにピンク（#e879a3）で統一。好調（緑）→ 注意（ピンク）→ 超過（赤）の
            3色グラデーションとして直感的に状態を伝える。
          </p>
        </div>
      </div>
    </div>
  )
}
