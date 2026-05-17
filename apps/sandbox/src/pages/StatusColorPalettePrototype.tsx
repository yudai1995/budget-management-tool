/**
 * StatusColorPalettePrototype — ステータスカラーパレット比較
 *
 * ホーム画面で使用する3系統のステータスカラーを横並び比較。
 * - 好調 / 達成系: Green (#35b5a2)
 * - 注意系: Pink (#e879a3) ← ブランドオレンジと被らない
 * - 超過 / 危険系: Red (#f43f5e)
 */

import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, TrendingUp, CheckCircle2, HelpCircle, MinusCircle } from 'lucide-react'

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


// ── 3系統のカラー定義 ────────────────────────────────────────────────────────
const PALETTES = [
  {
    key:         'safe',
    label:       '好調 / 達成',
    range:       '支出 ≤ 80% or 貯蓄目標達成',
    hero:        '#35b5a2',
    heroBg:      '#ecfaf8',
    heroBorder:  'rgba(53,181,162,0.30)',
    badgeBg:     'rgba(53,181,162,0.12)',
    badgeColor:  '#35b5a2',
    badgeLabel:  '好調',
    barGradient: 'linear-gradient(90deg, #34d399, #35b5a2)',
    barLight:    'rgba(53,181,162,0.22)',
    insightBg:   '#ecfaf8',
    insightColor:'#35b5a2',
    insightIcon: TrendingUp,
    insightMsg:  'このペースなら今月の貯蓄目標達成見込み',
    savingsBadgeBg:    'rgba(53,181,162,0.10)',
    savingsBadgeColor: '#35b5a2',
    savingsBadgeLabel: '達成見込み ✓',
    projectedLabel: '+¥74,600',
    projectedColor: '#35b5a2',
    projectedSub:   '貯まる見込み',
    // 日✓ 月✓ 火✓ 水✓ 木?(今日) 金- 土-
    streakStates: ['achieved','achieved','achieved','achieved','unrecorded','future','future'] as const,
  },
  {
    key:         'caution',
    label:       '注意',
    range:       '支出 81〜100% or 貯蓄目標 50〜99%',
    hero:        '#e879a3',
    heroBg:      'rgba(232,121,163,0.08)',
    heroBorder:  'rgba(232,121,163,0.30)',
    badgeBg:     'rgba(232,121,163,0.12)',
    badgeColor:  '#e879a3',
    badgeLabel:  '注意',
    barGradient: 'linear-gradient(90deg, #f9a8d4, #e879a3)',
    barLight:    'rgba(232,121,163,0.22)',
    insightBg:   'rgba(232,121,163,0.08)',
    insightColor:'#e879a3',
    insightIcon: AlertTriangle,
    insightMsg:  'あと少し節約すると目標達成できそう',
    savingsBadgeBg:    'rgba(232,121,163,0.12)',
    savingsBadgeColor: '#e879a3',
    savingsBadgeLabel: '目標まであと¥8,400',
    projectedLabel: '+¥21,600',
    projectedColor: '#e879a3',
    projectedSub:   '貯まる見込み',
    // 日✓ 月! 火✓ 水?(記録もれ) 木?(今日) 金- 土-
    streakStates: ['achieved','over','achieved','unrecorded','unrecorded','future','future'] as const,
  },
  {
    key:         'danger',
    label:       '超過 / 危険',
    range:       '支出 > 100% or 赤字見込み',
    hero:        '#f43f5e',
    heroBg:      'rgba(244,63,94,0.06)',
    heroBorder:  'rgba(244,63,94,0.28)',
    badgeBg:     'rgba(244,63,94,0.09)',
    badgeColor:  '#f43f5e',
    badgeLabel:  '超過',
    barGradient: 'linear-gradient(90deg, #fb7185, #f43f5e)',
    barLight:    'rgba(244,63,94,0.22)',
    insightBg:   'rgba(244,63,94,0.08)',
    insightColor:'#f43f5e',
    insightIcon: AlertCircle,
    insightMsg:  'このペースだと今月赤字になりそう',
    savingsBadgeBg:    'rgba(244,63,94,0.09)',
    savingsBadgeColor: '#f43f5e',
    savingsBadgeLabel: '赤字見込み',
    projectedLabel: '−¥12,300',
    projectedColor: '#f43f5e',
    projectedSub:   '不足見込み',
    // 日! 月!(超過続き) 火?(記録もれ) 水! 木?(今日) 金- 土-
    streakStates: ['over','over','unrecorded','over','unrecorded','future','future'] as const,
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
function PaletteCard({ p }: { p: typeof PALETTES[number] }) {
  const InsightIcon = p.insightIcon
  return (
    <div className="flex flex-col gap-3">
      {/* パレットラベル */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: p.hero }}>
          {p.label}
        </div>
        <div className="text-[10px]" style={{ color: D.muted }}>{p.range}</div>
      </div>

      {/* Block 1: 今日の状況 */}
      <div
        className="rounded-2xl p-4"
        style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: D.shadow }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-bold" style={{ color: D.text }}>今日の状況</span>
          <span
            className="px-2.5 py-0.5 text-[10px] font-bold"
            style={{ borderRadius: '9999px', background: p.badgeBg, color: p.badgeColor }}
          >
            {p.badgeLabel}
          </span>
        </div>
        <div className="flex justify-between text-[10px] mb-1" style={{ color: D.muted }}>
          <span>今日の支出</span>
          <span className="tabular-nums font-semibold">¥X,XXX / ¥7,692</span>
        </div>
        <Bar pct={p.key === 'safe' ? 24 : p.key === 'caution' ? 88 : 112} gradient={p.barGradient} delay={0.2} />
        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: p.insightBg }}
        >
          <InsightIcon size={13} style={{ color: p.insightColor, flexShrink: 0 }} />
          <span className="text-[10px] font-semibold leading-tight" style={{ color: p.insightColor }}>
            {p.insightMsg}
          </span>
        </div>
      </div>

      {/* Block 2: 今月の貯蓄予測 */}
      <div
        className="rounded-2xl p-4"
        style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: D.shadow }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-bold" style={{ color: D.text }}>今月の貯蓄予測</span>
          <span
            className="px-2 py-0.5 text-[10px] font-bold"
            style={{ borderRadius: '9999px', background: p.savingsBadgeBg, color: p.savingsBadgeColor }}
          >
            {p.savingsBadgeLabel}
          </span>
        </div>
        <div className="text-[9px] font-semibold mb-0.5" style={{ color: D.muted }}>月末予測残高</div>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-[22px] font-black" style={{ color: p.projectedColor, letterSpacing: '-0.03em' }}>
            {p.projectedLabel}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: D.muted }}>{p.projectedSub}</span>
        </div>
        <div className="relative">
          <Bar
            pct={p.key === 'safe' ? 59 : p.key === 'caution' ? 59 : 59}
            gradient={p.barGradient}
            delay={0.3}
          />
          {/* 予測延長（薄色） */}
          <div
            className="absolute top-0 h-2 rounded-r-full"
            style={{
              left: '59%',
              width: p.key === 'safe' ? '9%' : p.key === 'caution' ? '17%' : '25%',
              background: p.barLight,
            }}
          />
          {/* 目標ライン */}
          <div
            className="absolute top-0 h-2 w-0.5"
            style={{ left: '88%', background: 'rgba(28,20,16,0.28)' }}
          />
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1 pt-2.5 border-t text-center" style={{ borderColor: D.border }}>
          {[
            { label: '残り予算', value: '¥103,900' },
            { label: '残り日数', value: 'あと16日' },
            { label: '1日の目安', value: p.key === 'danger' ? '¥0' : '¥6,494' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-[8px] font-semibold mb-0.5" style={{ color: D.muted }}>{item.label}</div>
              <div className="text-[11px] font-extrabold tabular-nums" style={{ color: D.text }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Block 3: ストリークドット例 */}
      <div
        className="rounded-2xl p-4"
        style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: D.shadow }}
      >
        <div className="text-[12px] font-bold mb-3" style={{ color: D.text }}>今週の記録</div>
        <div className="grid grid-cols-7 gap-1">
          {/* 日〜土 / TODAY_IDX=4(木)が今日 / 金・土は未来 */}
          {(['日','月','火','水','木','金','土'] as const).map((dow, i) => {
            const TODAY_IDX = 4
            const state = p.streakStates[i]
            const isToday = i === TODAY_IDX
            // ✓達成 / !超過 / ?未入力(過去・今日) / -未来
            const StreakIcon  = state === 'achieved'   ? CheckCircle2
                              : state === 'over'        ? AlertCircle
                              : state === 'unrecorded'  ? HelpCircle
                              : MinusCircle
            const streakColor = state === 'achieved'   ? D.brand
                              : state === 'over'        ? '#f43f5e'
                              : state === 'unrecorded'  ? 'rgba(28,20,16,0.38)'
                              : 'rgba(28,20,16,0.15)'
            return (
              <div key={dow} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold" style={{ color: isToday ? D.brand : D.muted }}>{dow}</span>
                <StreakIcon size={20} strokeWidth={2} style={{ color: streakColor }} />
              </div>
            )
          })}
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
            { label: 'Hero',   color: p.hero },
            { label: 'Badge',  color: p.badgeColor },
            { label: 'Bar',    color: p.hero, gradient: p.barGradient },
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
export function StatusColorPalettePrototype() {
  return (
    <div className="min-h-screen pb-16" style={{ background: D.bg }}>
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{ background: 'rgba(255,253,245,0.92)', backdropFilter: 'blur(12px)', borderColor: D.border }}
      >
        <h1 className="text-[15px] font-extrabold" style={{ color: D.text }}>
          ステータスカラーパレット
        </h1>
        <p className="text-[11px] mt-0.5" style={{ color: D.muted }}>
          ホーム画面の3ステータス（好調 / 注意 / 超過）を全コンポーネントで横並び比較
        </p>
      </div>

      {/* カラー凡例バー */}
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 flex-wrap">
          {PALETTES.map(p => (
            <span key={p.key} className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="h-3 w-3 rounded-full inline-block" style={{ background: p.hero }} />
              {p.label}
            </span>
          ))}
          <span className="ml-2 text-[10px]" style={{ color: D.muted }}>
            ※ 注意はブランドオレンジ（#f18840）と区別するためピンクを使用
          </span>
        </div>
      </div>

      {/* 3カラム比較 */}
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PALETTES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.08 }}
            >
              <PaletteCard p={p} />
            </motion.div>
          ))}
        </div>

        {/* 使用箇所まとめ */}
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
                  {['コンポーネント', '好調（緑）', '注意（ピンク）', '超過（赤）'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: D.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    comp: '今日の状況 バッジ',
                    safe: '支出 ≤ 80%',
                    caution: '支出 81〜100%',
                    danger: '支出 > 100%',
                  },
                  {
                    comp: '今日の状況 バー',
                    safe: '≤ 80%',
                    caution: '81〜100%',
                    danger: '> 100%',
                  },
                  {
                    comp: '貯蓄インサイト',
                    safe: '達成率 ≥ 100%',
                    caution: '達成率 50〜99%',
                    danger: '赤字見込み / 達成率 < 50%',
                  },
                  {
                    comp: '貯蓄予測 バッジ',
                    safe: '達成見込み ✓',
                    caution: '目標まであと¥XX',
                    danger: '赤字見込み / 達成困難',
                  },
                  {
                    comp: '貯蓄予測 バー',
                    safe: '予測支出 < 目標ライン',
                    caution: '予測支出 ≈ 目標ライン',
                    danger: '予測支出 > 目標ライン',
                  },
                  {
                    comp: 'ストリーク アイコン',
                    safe: '✓達成 / ?未入力 / -未来',
                    caution: '✓達成 / !超過 / ?未入力 / -未来',
                    danger: '!超過 / ?未入力 / -未来',
                  },
                ].map(row => (
                  <tr key={row.comp} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: D.text }}>{row.comp}</td>
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
