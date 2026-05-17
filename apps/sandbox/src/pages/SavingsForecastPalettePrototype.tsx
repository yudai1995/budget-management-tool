/**
 * SavingsForecastPalettePrototype — 今月の貯蓄予測 カラーパレット比較
 *
 * 貯蓄達成率に応じた4状態のカラー・UI を横並び比較。
 * - 超好調: 達成率 ≥ 150%  → brand orange (#f18840) + Sparkles
 * - 好調:   達成率 100〜149% → green (#35b5a2)  + TrendingUp
 * - 注意:   達成率 50〜99%  → pink  (#e879a3)  + AlertTriangle
 * - 危険:   達成率 < 50% / 赤字見込み → red (#f43f5e) + AlertCircle
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
// 共通モック: 収入¥252,600 / 貯蓄目標¥30,000 / 月15日経過 / 目標ライン=88%
const PALETTES = [
  {
    key:          'excellent',
    label:        '超好調',
    range:        '達成率 ≥ 150%',
    description:  'このペースで月末を迎えると貯蓄目標の+148%を達成',
    hero:         '#f18840',
    heroBg:       '#fff6ee',
    heroBorder:   'rgba(241,136,64,0.30)',
    badgeBg:      'rgba(241,136,64,0.12)',
    badgeColor:   '#f18840',
    badgeLabel:   '目標 +148% 達成見込み！',
    InsightIcon:  Sparkles,
    insightBg:    '#fff6ee',
    insightColor: '#f18840',
    insightMsg:   '今日この調子なら目標 +148% 達成見込み！',
    barGradient:  'linear-gradient(90deg, #fbbf24, #f18840)',
    barLight:     'rgba(241,136,64,0.18)',
    heroAmount:   '+¥74,600',
    heroSub:      '貯まる見込み',
    heroColor:    '#f18840',
    // バー: 実績59% / 予測+9% / 目標ライン88%
    actualPct:    59,
    projectedPct: 9,
    targetPct:    88,
    stats: [
      { label: '残り予算',  value: '¥103,900' },
      { label: '残り日数',  value: 'あと16日' },
      { label: '1日の目安', value: '¥6,494' },
    ],
  },
  {
    key:          'safe',
    label:        '好調',
    range:        '達成率 100〜149%',
    description:  '目標貯蓄額は達成見込みだが大幅超過ではない',
    hero:         '#35b5a2',
    heroBg:       '#ecfaf8',
    heroBorder:   'rgba(53,181,162,0.30)',
    badgeBg:      'rgba(53,181,162,0.10)',
    badgeColor:   '#35b5a2',
    badgeLabel:   '達成見込み ✓',
    InsightIcon:  TrendingUp,
    insightBg:    '#ecfaf8',
    insightColor: '#35b5a2',
    insightMsg:   'このペースなら今月の貯蓄目標達成見込み',
    barGradient:  'linear-gradient(90deg, #34d399, #35b5a2)',
    barLight:     'rgba(53,181,162,0.22)',
    heroAmount:   '+¥34,200',
    heroSub:      '貯まる見込み',
    heroColor:    '#35b5a2',
    // バー: 実績68% / 予測+10% / 目標ライン88%
    actualPct:    68,
    projectedPct: 10,
    targetPct:    88,
    stats: [
      { label: '残り予算',  value: '¥83,400' },
      { label: '残り日数',  value: 'あと16日' },
      { label: '1日の目安', value: '¥5,213' },
    ],
  },
  {
    key:          'caution',
    label:        '注意',
    range:        '達成率 50〜99%',
    description:  '目標に届かない見込みだが黒字圏内',
    hero:         '#e879a3',
    heroBg:       'rgba(232,121,163,0.08)',
    heroBorder:   'rgba(232,121,163,0.30)',
    badgeBg:      'rgba(232,121,163,0.12)',
    badgeColor:   '#e879a3',
    badgeLabel:   '目標まであと¥8,400',
    InsightIcon:  AlertTriangle,
    insightBg:    'rgba(232,121,163,0.08)',
    insightColor: '#e879a3',
    insightMsg:   'あと少し節約すると目標達成できそう',
    barGradient:  'linear-gradient(90deg, #f9a8d4, #e879a3)',
    barLight:     'rgba(232,121,163,0.22)',
    heroAmount:   '+¥21,600',
    heroSub:      '貯まる見込み',
    heroColor:    '#e879a3',
    // バー: 実績79% / 予測+5% / 目標ライン88%
    actualPct:    79,
    projectedPct: 5,
    targetPct:    88,
    stats: [
      { label: '残り予算',  value: '¥52,600' },
      { label: '残り日数',  value: 'あと16日' },
      { label: '1日の目安', value: '¥3,288' },
    ],
  },
  {
    key:          'danger',
    label:        '危険',
    range:        '達成率 < 50% / 赤字見込み',
    description:  '赤字または貯蓄目標達成が困難な状態',
    hero:         '#f43f5e',
    heroBg:       'rgba(244,63,94,0.06)',
    heroBorder:   'rgba(244,63,94,0.28)',
    badgeBg:      'rgba(244,63,94,0.09)',
    badgeColor:   '#f43f5e',
    badgeLabel:   '赤字見込み',
    InsightIcon:  AlertCircle,
    insightBg:    'rgba(244,63,94,0.08)',
    insightColor: '#f43f5e',
    insightMsg:   'このペースだと今月赤字になりそう',
    barGradient:  'linear-gradient(90deg, #fb7185, #f43f5e)',
    barLight:     'rgba(244,63,94,0.22)',
    heroAmount:   '−¥12,300',
    heroSub:      '不足見込み',
    heroColor:    '#f43f5e',
    // バー: 実績95% / 予測+10%（超過） / 目標ライン88%
    actualPct:    95,
    projectedPct: 8,
    targetPct:    88,
    stats: [
      { label: '残り予算',  value: '¥12,600' },
      { label: '残り日数',  value: 'あと16日' },
      { label: '1日の目安', value: '¥0' },
    ],
  },
] as const

// ── 共通ProgressBar ──────────────────────────────────────────────────────────
function Bar({
  actualPct, projectedPct, targetPct, gradient, light, delay = 0,
}: {
  actualPct: number; projectedPct: number; targetPct: number;
  gradient: string; light: string; delay?: number;
}) {
  const overflows = actualPct + projectedPct > 100
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(28,20,16,0.06)' }}>
      {/* 実績バー */}
      <motion.div
        className="absolute h-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(actualPct, 100)}%` }}
        transition={{ type: 'spring', stiffness: 70, damping: 18, delay }}
        style={{ background: gradient, borderRadius: '9999px 0 0 9999px' }}
      />
      {/* 予測延長バー */}
      <motion.div
        className="absolute h-full"
        initial={{ width: 0 }}
        animate={{ width: `${overflows ? Math.min(projectedPct, 100 - actualPct) : projectedPct}%` }}
        transition={{ type: 'spring', stiffness: 70, damping: 18, delay: delay + 0.15 }}
        style={{ left: `${Math.min(actualPct, 100)}%`, background: light }}
      />
      {/* 目標ライン */}
      <div
        className="absolute top-0 h-full w-0.5"
        style={{ left: `${targetPct}%`, background: 'rgba(28,20,16,0.28)' }}
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
        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: p.hero }}>
          {p.label}
        </div>
        <div className="text-[10px] font-semibold mb-0.5" style={{ color: D.muted }}>{p.range}</div>
        <div className="text-[9px]" style={{ color: 'rgba(28,20,16,0.35)' }}>{p.description}</div>
      </div>

      {/* 今月の貯蓄予測カード */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: D.shadow }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold" style={{ color: D.text }}>今月の貯蓄予測</span>
          <span
            className="px-2 py-0.5 text-[9px] font-bold leading-tight text-right"
            style={{ borderRadius: '9999px', background: p.badgeBg, color: p.badgeColor, maxWidth: 120 }}
          >
            {p.badgeLabel}
          </span>
        </div>

        {/* ヒーロー金額 */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-black tabular-nums" style={{ color: p.heroColor, letterSpacing: '-0.03em' }}>
            {p.heroAmount}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: D.muted }}>{p.heroSub}</span>
        </div>

        {/* 予測バー */}
        <div>
          <div className="mb-1.5 flex justify-between text-[9px]" style={{ color: D.muted }}>
            <span>実績支出 {p.actualPct}%</span>
            <span>目標ライン {p.targetPct}%</span>
          </div>
          <Bar
            actualPct={p.actualPct}
            projectedPct={p.projectedPct}
            targetPct={p.targetPct}
            gradient={p.barGradient}
            light={p.barLight}
            delay={delay + 0.2}
          />
          <div className="mt-1 flex justify-between text-[9px]" style={{ color: 'rgba(28,20,16,0.28)' }}>
            <span>実績</span>
            <span>← 予測延長</span>
          </div>
        </div>

        {/* インサイト */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: p.insightBg }}
        >
          <InsightIcon size={12} style={{ color: p.insightColor, flexShrink: 0 }} />
          <span className="text-[10px] font-semibold leading-tight" style={{ color: p.insightColor }}>
            {p.insightMsg}
          </span>
        </div>

        {/* 補助3指標 */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: D.border }}>
          {p.stats.map(item => (
            <div key={item.label} className="text-center">
              <div className="text-[8px] font-semibold mb-0.5" style={{ color: D.muted }}>{item.label}</div>
              <div className="text-[11px] font-extrabold tabular-nums" style={{ color: D.text }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* カラートークン */}
      <div
        className="rounded-xl p-3"
        style={{ background: D.card, border: `1px solid ${D.border}` }}
      >
        <div className="text-[10px] font-bold mb-2" style={{ color: D.muted }}>カラートークン</div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'Hero / Badge', color: p.hero },
            { label: 'Bar (実績)',   gradient: p.barGradient, color: p.hero },
            { label: 'Bar (予測)',   gradient: p.barLight,    color: p.hero, isLight: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded shrink-0"
                style={{ background: item.gradient ?? item.color }}
              />
              <span className="text-[10px] font-semibold" style={{ color: D.text }}>{item.label}</span>
              <span className="ml-auto text-[9px] font-mono" style={{ color: D.muted }}>{item.color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function SavingsForecastPalettePrototype() {
  return (
    <div className="min-h-screen pb-16" style={{ background: D.bg }}>
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{ background: 'rgba(255,253,245,0.92)', backdropFilter: 'blur(12px)', borderColor: D.border }}
      >
        <h1 className="text-[15px] font-extrabold" style={{ color: D.text }}>
          今月の貯蓄予測 — カラーパレット比較
        </h1>
        <p className="text-[11px] mt-0.5" style={{ color: D.muted }}>
          貯蓄達成率に応じた4状態（超好調 / 好調 / 注意 / 危険）を横並び比較
        </p>
      </div>

      {/* 凡例バー */}
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-2">
        <div className="flex items-center gap-4 flex-wrap">
          {PALETTES.map(p => (
            <span key={p.key} className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="h-3 w-3 rounded-full inline-block" style={{ background: p.hero }} />
              {p.label}
              <span className="font-normal text-[10px]" style={{ color: D.muted }}>（{p.range}）</span>
            </span>
          ))}
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

        {/* 閾値・使用箇所テーブル */}
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
                    '超好調（オレンジ）≥150%',
                    '好調（緑）100〜149%',
                    '注意（ピンク）50〜99%',
                    '危険（赤）<50% / 赤字',
                  ].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: D.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    comp: 'バッジ',
                    excellent: '目標 +XX% 達成見込み！',
                    safe:      '達成見込み ✓',
                    caution:   '目標まであと¥X,XXX',
                    danger:    '赤字見込み / 達成困難',
                  },
                  {
                    comp: 'ヒーロー金額',
                    excellent: '+¥XX,XXX（オレンジ）',
                    safe:      '+¥XX,XXX（緑）',
                    caution:   '+¥XX,XXX（ピンク）',
                    danger:    '−¥XX,XXX（赤）',
                  },
                  {
                    comp: '予測バー',
                    excellent: '目標ライン大幅に左',
                    safe:      '目標ライン左に余裕',
                    caution:   '目標ラインに接近',
                    danger:    '目標ラインを超過',
                  },
                  {
                    comp: 'インサイト アイコン',
                    excellent: 'Sparkles',
                    safe:      'TrendingUp',
                    caution:   'AlertTriangle',
                    danger:    'AlertCircle',
                  },
                  {
                    comp: 'インサイト メッセージ',
                    excellent: '目標 +XX% 達成見込み！',
                    safe:      'このペースなら目標達成見込み',
                    caution:   'あと少し節約すると達成できそう',
                    danger:    'このペースだと赤字になりそう',
                  },
                  {
                    comp: '1日の目安',
                    excellent: '余裕あり（黒テキスト）',
                    safe:      '余裕あり（黒テキスト）',
                    caution:   '少なめ（黒テキスト）',
                    danger:    '¥0（赤テキスト）',
                  },
                ].map(row => (
                  <tr key={row.comp} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: D.text }}>{row.comp}</td>
                    <td className="px-4 py-2.5" style={{ color: '#f18840' }}>{row.excellent}</td>
                    <td className="px-4 py-2.5" style={{ color: '#35b5a2' }}>{row.safe}</td>
                    <td className="px-4 py-2.5" style={{ color: '#e879a3' }}>{row.caution}</td>
                    <td className="px-4 py-2.5" style={{ color: '#f43f5e' }}>{row.danger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
