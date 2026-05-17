/**
 * AssetOutlookPcABPrototype — 長期指標 PCレイアウト A/B/C 比較
 *
 * SP はスワイプUIで A/B/C を切り替える方針が確定。
 * PC では情報密度を活かす別レイアウトを比較するためのページ。
 *
 * Layout 1: 全パターン同時表示（3カラム）
 * Layout 2: タブ切替（フォーカス重視）
 * Layout 3: 表示/非表示トグル（アコーディオン）
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import {
    D,
    SPRING,
    PATTERNS,
    PATTERN_META,
    PATTERN_DETAILS,
    type PatternId,
    PatternAHero,
    PatternBHero,
    PatternCHero,
    MetaAccordion,
} from './AssetOutlookABPrototype'

// ─── ヒーローレンダラ ────────────────────────────────────────────────────
function renderHero(id: PatternId) {
    const accent = PATTERN_META[id].accent
    if (id === 'A') return <PatternAHero accent={accent} />
    if (id === 'B') return <PatternBHero accent={accent} />
    return <PatternCHero accent={accent} />
}

// ─── 共通カードラッパ ────────────────────────────────────────────────────
function HeroCard({ id, children }: { id: PatternId; children: React.ReactNode }) {
    const accent = PATTERN_META[id].accent
    return (
        <motion.div
            className="relative rounded-3xl overflow-hidden"
            style={{
                background: D.heroBg,
                border:     `1px solid ${D.border}`,
                boxShadow:  D.shadowMd,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING.SMOOTH}
        >
            {/* グローオーブ */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 220, height: 220, top: -80, right: -70,
                    background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* ラベル */}
            <div className="px-5 pt-4 pb-1">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                    Pattern {id} — {PATTERN_META[id].name}
                </div>
            </div>
            {/* コンテンツ */}
            <div className="px-5 pt-3 pb-5">
                {children}
            </div>
        </motion.div>
    )
}

// ─── セクションラベル ────────────────────────────────────────────────────
function SectionHeader({ no, title, desc }: { no: string; title: string; desc: string }) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-extrabold text-white rounded-full"
                style={{ background: D.text }}
            >
                {no}
            </span>
            <div>
                <div className="text-base font-extrabold" style={{ color: D.text }}>{title}</div>
                <div className="text-xs mt-0.5" style={{ color: D.muted }}>{desc}</div>
            </div>
        </div>
    )
}

// ─── Layout 1: 全パターン同時表示 ────────────────────────────────────────
function Layout1AllVisible() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PATTERNS.map(id => (
                <div key={id} className="flex flex-col gap-3">
                    <HeroCard id={id}>
                        {renderHero(id)}
                    </HeroCard>
                    <div
                        className="rounded-2xl border px-4"
                        style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
                    >
                        <MetaAccordion {...PATTERN_DETAILS[id]} />
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Layout 2: タブ切替 ──────────────────────────────────────────────────
function Layout2Tabs() {
    const [active, setActive] = useState<PatternId>('A')
    return (
        <div>
            {/* タブナビ */}
            <div
                className="inline-flex p-1 mb-4"
                style={{ borderRadius: 12, background: 'rgba(28,20,16,0.06)' }}
                role="tablist"
            >
                {PATTERNS.map(id => {
                    const isActive = active === id
                    const itemAccent = PATTERN_META[id].accent
                    return (
                        <motion.button
                            key={id}
                            type="button"
                            onClick={() => setActive(id)}
                            whileTap={{ scale: 0.97 }}
                            transition={SPRING.SNAP}
                            role="tab"
                            aria-selected={isActive}
                            className="relative px-4 py-2 text-sm font-bold"
                            style={{
                                borderRadius: 10,
                                color:        isActive ? '#fff' : D.muted,
                                zIndex:       1,
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="pc-tab-bg"
                                    className="absolute inset-0"
                                    style={{
                                        borderRadius: 10,
                                        background:   itemAccent,
                                        boxShadow:    `0 2px 8px ${itemAccent}50`,
                                    }}
                                    transition={SPRING.BASE}
                                />
                            )}
                            <span className="relative z-10">
                                <span className="opacity-70 mr-1">{id}</span>
                                {PATTERN_META[id].name}
                            </span>
                        </motion.button>
                    )
                })}
            </div>

            {/* コンテンツ — 大きめ表示 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)] gap-4 items-start">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                    >
                        <HeroCard id={active}>
                            {renderHero(active)}
                        </HeroCard>
                    </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`meta-${active}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-2xl border px-4"
                        style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
                    >
                        <MetaAccordion {...PATTERN_DETAILS[active]} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Layout 3: 表示/非表示トグル ────────────────────────────────────────
function Layout3Toggle() {
    const [visible, setVisible] = useState<Record<PatternId, boolean>>({ A: true, B: true, C: true })
    function toggle(id: PatternId) { setVisible(prev => ({ ...prev, [id]: !prev[id] })) }
    return (
        <div className="space-y-3 max-w-3xl">
            {PATTERNS.map(id => {
                const isOpen = visible[id]
                const itemAccent = PATTERN_META[id].accent
                return (
                    <div
                        key={id}
                        className="rounded-2xl border overflow-hidden"
                        style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
                    >
                        <motion.button
                            type="button"
                            onClick={() => toggle(id)}
                            whileTap={{ scale: 0.995 }}
                            transition={SPRING.SNAP}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex h-6 w-6 items-center justify-center text-[11px] font-extrabold text-white rounded-md"
                                    style={{ background: itemAccent }}
                                >
                                    {id}
                                </span>
                                <span className="text-sm font-bold" style={{ color: D.text }}>
                                    Pattern {id} — {PATTERN_META[id].name}
                                </span>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: D.muted }}>
                                {isOpen ? <Eye size={13} /> : <EyeOff size={13} />}
                                {isOpen ? '表示中' : '非表示'}
                                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                        </motion.button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={SPRING.QUICK}
                                    className="overflow-hidden"
                                >
                                    <div className="border-t" style={{ borderColor: D.border }}>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_minmax(260px,320px)] gap-4 items-start">
                                            <HeroCard id={id}>
                                                {renderHero(id)}
                                            </HeroCard>
                                            <div
                                                className="rounded-2xl border px-4"
                                                style={{ background: D.bg, borderColor: D.border }}
                                            >
                                                <MetaAccordion {...PATTERN_DETAILS[id]} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}

// ─── メインページ ────────────────────────────────────────────────────────
export function AssetOutlookPcABPrototype() {
    return (
        <div className="min-h-screen pb-16" style={{ background: D.bg }}>
            {/* ヘッダー */}
            <div
                className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b px-4"
                style={{ background: `${D.bg}ee`, backdropFilter: 'blur(12px)', borderColor: D.border }}
            >
                <Link to="/" className="flex items-center gap-1 text-xs font-semibold" style={{ color: D.brand }}>
                    <ChevronLeft size={14} />ギャラリー
                </Link>
                <span className="text-sm font-extrabold" style={{ color: D.text }}>
                    長期指標 — PCレイアウト A/B/C 比較
                </span>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
                {/* イントロ */}
                <div
                    className="mb-6 rounded-2xl border px-4 py-3 text-xs"
                    style={{ background: D.card, borderColor: D.border, color: D.muted, boxShadow: D.shadow }}
                >
                    SP の <Link to="/asset-outlook-ab" className="font-semibold underline" style={{ color: D.brand }}>長期指標 A/B/C</Link>{' '}
                    はスワイプUI で確定。PC ではどう見せるかを 3 パターンで比較します。
                </div>

                {/* Layout 1 */}
                <section className="mb-10">
                    <SectionHeader
                        no="1"
                        title="全パターン同時表示"
                        desc="3カラムグリッドで A/B/C を並列表示。一覧性が高く、PC の広い画面を活かせる。"
                    />
                    <Layout1AllVisible />
                </section>

                {/* Layout 2 */}
                <section className="mb-10">
                    <SectionHeader
                        no="2"
                        title="タブ切替"
                        desc="タブで一つに絞ってフォーカス。SP との UX 連続性が保てる。"
                    />
                    <Layout2Tabs />
                </section>

                {/* Layout 3 */}
                <section className="mb-10">
                    <SectionHeader
                        no="3"
                        title="表示／非表示トグル"
                        desc="アコーディオン式。ユーザーが見たい指標だけ広げて、不要なものは閉じておける。"
                    />
                    <Layout3Toggle />
                </section>

                {/* 比較サマリー */}
                <div
                    className="rounded-2xl border overflow-hidden"
                    style={{ background: D.card, borderColor: D.border, boxShadow: D.shadow }}
                >
                    <div className="px-4 pt-4 pb-2">
                        <div className="text-sm font-extrabold" style={{ color: D.text }}>レイアウト比較</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                                    {['', '①同時表示', '②タブ', '③トグル'].map(h => (
                                        <th
                                            key={h}
                                            className="px-4 py-2.5 text-left font-bold whitespace-nowrap"
                                            style={{ color: D.muted }}
                                        >{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: '一覧性',         vals: ['◎ 全て一目で比較', '△ 一度に1指標', '○ 開けば見える'] },
                                    { label: 'フォーカス',     vals: ['△ 散漫になりやすい', '◎ 注視できる', '◎ ユーザー選択'] },
                                    { label: 'SP との連続性',  vals: ['△ 別UX', '◎ スワイプ↔タブで連続', '○'] },
                                    { label: '縦スクロール量', vals: ['少', '少', '中（開いた数次第）'] },
                                    { label: '実装コスト',     vals: ['低', '低〜中', '中'] },
                                    { label: '初心者の理解度', vals: ['△ 情報過多', '◎ シンプル', '○'] },
                                ].map(row => (
                                    <tr key={row.label} style={{ borderBottom: `1px solid ${D.border}` }}>
                                        <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: D.muted }}>{row.label}</td>
                                        {row.vals.map((v, i) => (
                                            <td key={i} className="px-4 py-2.5" style={{ color: D.text }}>{v}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ナビ */}
                <div className="mt-6 flex items-center justify-between text-xs" style={{ color: D.muted }}>
                    <Link to="/asset-outlook-ab" style={{ color: D.brand }} className="font-semibold hover:underline">
                        ← SP A/B/C
                    </Link>
                    <Link to="/home" style={{ color: D.brand }} className="font-semibold hover:underline">
                        ホームへ →
                    </Link>
                </div>
            </div>
        </div>
    )
}
