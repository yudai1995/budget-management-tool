/**
 * CategoryTopABPrototype — 支出カテゴリ TOP 表示パターン比較
 *
 * Pattern A: 水平棒グラフ（金額 + 割合）
 * Pattern B: ランキングリスト（先月比トレンド付き）
 * Pattern C: ドーナツ概要 + TOP3 カード
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShoppingBasket, ShoppingBag, Car, Zap, Tag, Heart,
    TrendingUp, TrendingDown, Minus, ChevronLeft,
} from "lucide-react";

const R = { card: "12px", inner: "8px", badge: "9999px" } as const;
const C = {
    bg: "#fffdf5", card: "#ffffff", text: "#1c1410",
    muted: "rgba(28,20,16,0.45)", border: "#e8c8b0",
    shadow: "0 1px 4px 0 rgba(28,20,16,0.07), 0 0 0 1px rgba(28,20,16,0.06)",
    brand: "#f18840", brandLight: "#fff6ee",
    income: "#35b5a2", incomeLight: "#ecfaf8",
    expense: "#f18840", expenseLight: "#fff6ee",
    danger: "#f43f5e",
} as const;

// ─── モックデータ ────────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 1, name: "食費",   icon: ShoppingBasket, color: C.expense,  amount: 45200, lastMonth: 36700 },
    { id: 2, name: "日用品", icon: ShoppingBag,    color: "#a855f7",  amount: 38500, lastMonth: 42000 },
    { id: 3, name: "交通費", icon: Car,            color: "#3b82f6",  amount: 18900, lastMonth: 19200 },
    { id: 4, name: "光熱費", icon: Zap,            color: "#ca8a04",  amount: 15800, lastMonth: 14600 },
    { id: 5, name: "娯楽費", icon: Tag,            color: "#ec4899",  amount: 12400, lastMonth: 8900  },
    { id: 6, name: "医療費", icon: Heart,          color: "#ef4444",  amount: 8200,  lastMonth: 3000  },
    { id: 7, name: "その他", icon: Tag,            color: C.muted,    amount: 9700,  lastMonth: 7100  },
];
const TOTAL = CATEGORIES.reduce((s, c) => s + c.amount, 0);

function yen(n: number) { return `¥${n.toLocaleString("ja-JP")}`; }
function pct(n: number, total: number) { return `${Math.round((n / total) * 100)}%`; }
function diff(a: number, b: number) { return a - b; }

// ─── 共通: メタ情報ブロック ───────────────────────────────────────────────

function Meta({ pros, cons, data }: { pros: string[]; cons: string[]; data: string[] }) {
    return (
        <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: C.border }}>
            <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>得られる情報</div>
                <ul className="space-y-0.5">
                    {data.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: C.text + "cc" }}>
                            <span style={{ color: C.income, flexShrink: 0 }}>•</span>{d}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="mb-1 text-[10px] font-bold" style={{ color: C.income }}>メリット</div>
                    <ul className="space-y-0.5">
                        {pros.map((p, i) => (
                            <li key={i} className="text-[11px]" style={{ color: C.text + "bb" }}>✓ {p}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div className="mb-1 text-[10px] font-bold" style={{ color: C.danger }}>デメリット</div>
                    <ul className="space-y-0.5">
                        {cons.map((c, i) => (
                            <li key={i} className="text-[11px]" style={{ color: C.text + "bb" }}>✗ {c}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function PatternLabel({ label, name }: { label: string; name: string }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <span
                className="flex h-6 w-6 items-center justify-center text-xs font-extrabold text-white"
                style={{ background: C.text, borderRadius: R.badge }}
            >
                {label}
            </span>
            <span className="text-sm font-bold" style={{ color: C.text }}>{name}</span>
        </div>
    );
}

// ─── Pattern A: 水平棒グラフ ──────────────────────────────────────────────

function PatternA() {
    const maxAmount = Math.max(...CATEGORIES.map((c) => c.amount));
    return (
        <div>
            <PatternLabel label="A" name="水平棒グラフ" />
            <div className="mb-2 flex items-center justify-between text-xs" style={{ color: C.muted }}>
                <span className="font-bold" style={{ color: C.text }}>支出カテゴリ</span>
                <span>今月合計 {yen(TOTAL)}</span>
            </div>
            <div className="space-y-2.5">
                {CATEGORIES.map((cat, i) => {
                    const Icon = cat.icon;
                    const d = diff(cat.amount, cat.lastMonth);
                    return (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="mb-1 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Icon size={12} style={{ color: cat.color }} />
                                    <span className="text-[12px] font-semibold" style={{ color: C.text }}>{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-[10px] font-medium tabular-nums"
                                        style={{ color: d > 0 ? C.danger : C.income }}
                                    >
                                        {d > 0 ? "+" : "−"}¥{Math.abs(d).toLocaleString("ja-JP")}
                                    </span>
                                    <span className="font-mono text-[12px] font-bold tabular-nums" style={{ color: C.text }}>
                                        {yen(cat.amount)}
                                    </span>
                                    <span className="w-8 text-right text-[10px] tabular-nums" style={{ color: C.muted }}>
                                        {pct(cat.amount, TOTAL)}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 overflow-hidden" style={{ background: "rgba(28,20,16,0.07)", borderRadius: R.badge }}>
                                <motion.div
                                    className="h-full"
                                    style={{ background: cat.color, borderRadius: R.badge, opacity: 0.85 }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(cat.amount / maxAmount) * 100}%` }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <Meta
                data={[
                    "各カテゴリの絶対額・全体比率",
                    "先月差分（増減額）",
                    "カテゴリ間の相対的な大きさ",
                ]}
                pros={["全カテゴリを一覧できる", "大小比較が直感的", "数値と割合が同時に見える"]}
                cons={["カテゴリが多いと縦長になる", "比率よりも長さで判断するので精度は低い"]}
            />
        </div>
    );
}

// ─── Pattern B: ランキングリスト（先月比トレンド付き）────────────────────

function PatternB() {
    const sorted = [...CATEGORIES].sort((a, b) => b.amount - a.amount);
    return (
        <div>
            <PatternLabel label="B" name="ランキングリスト（先月比付き）" />
            <div className="mb-2 flex items-center justify-between text-xs" style={{ color: C.muted }}>
                <span className="font-bold" style={{ color: C.text }}>支出カテゴリ TOP</span>
                <span>今月合計 {yen(TOTAL)}</span>
            </div>
            <ul className="divide-y" style={{ borderColor: C.border }}>
                {sorted.map((cat, i) => {
                    const Icon = cat.icon;
                    const d = diff(cat.amount, cat.lastMonth);
                    const dPct = Math.round((d / cat.lastMonth) * 100);
                    const TrendIcon = d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus;
                    const trendColor = d > 0 ? C.danger : d < 0 ? C.income : C.muted;
                    return (
                        <motion.li
                            key={cat.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 py-2.5"
                        >
                            <span
                                className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-extrabold"
                                style={{
                                    background: i < 3 ? cat.color : "rgba(28,20,16,0.08)",
                                    color: i < 3 ? "#fff" : C.muted,
                                    borderRadius: R.badge,
                                }}
                            >
                                {i + 1}
                            </span>
                            <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center"
                                style={{
                                    background: `color-mix(in srgb, ${cat.color} 12%, white)`,
                                    borderRadius: R.inner,
                                }}
                            >
                                <Icon size={14} style={{ color: cat.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold" style={{ color: C.text }}>{cat.name}</div>
                                <div className="flex items-center gap-1 text-[10px]" style={{ color: C.muted }}>
                                    <span className="tabular-nums">先月 {yen(cat.lastMonth)}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="font-mono text-[13px] font-extrabold tabular-nums" style={{ color: C.text }}>
                                    {yen(cat.amount)}
                                </div>
                                <div className="flex items-center justify-end gap-0.5 text-[10px] font-semibold" style={{ color: trendColor }}>
                                    <TrendIcon size={10} />
                                    <span className="tabular-nums">{dPct > 0 ? "+" : ""}{dPct}%</span>
                                </div>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
            <Meta
                data={[
                    "支出額の順位（何に一番使っているか）",
                    "先月比の増減率（%）",
                    "トレンド方向（増加/減少）",
                ]}
                pros={["増減のトレンドが一目でわかる", "順位が明確で「1位は食費」など記憶に残る"]}
                cons={["全体比率が視覚的に見えない", "先月データがないと表示できない"]}
            />
        </div>
    );
}

// ─── Pattern C: ドーナツ概要 + TOP3 カード ─────────────────────────────

function DonutChart() {
    const size = 120;
    const r = 44;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    // 累積比率を事前計算（render中の変数再代入を避けるため）
    const ratios = CATEGORIES.map((cat) => cat.amount / TOTAL);
    const offsets = ratios.map((_, i) => ratios.slice(0, i).reduce((s, v) => s + v, 0));

    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {CATEGORIES.map((cat, i) => {
                const ratio = ratios[i];
                const strokeDasharray = `${ratio * circumference} ${circumference}`;
                const strokeDashoffset = -offsets[i] * circumference;
                return (
                    <circle
                        key={cat.id}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth={16}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        opacity={0.85}
                    />
                );
            })}
        </svg>
    );
}

function PatternC() {
    const top3 = [...CATEGORIES].sort((a, b) => b.amount - a.amount).slice(0, 3);
    const top3Total = top3.reduce((s, c) => s + c.amount, 0);
    return (
        <div>
            <PatternLabel label="C" name="ドーナツ + TOP3 カード" />
            <div className="mb-3 flex items-center justify-between text-xs" style={{ color: C.muted }}>
                <span className="font-bold" style={{ color: C.text }}>支出カテゴリ</span>
                <span>今月合計 {yen(TOTAL)}</span>
            </div>
            {/* ドーナツ + 凡例 */}
            <div className="mb-4 flex items-center gap-4">
                <div className="relative shrink-0">
                    <DonutChart />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-[10px] font-semibold" style={{ color: C.muted }}>合計</div>
                        <div className="font-mono text-[13px] font-extrabold tabular-nums" style={{ color: C.text }}>
                            {yen(TOTAL)}
                        </div>
                    </div>
                </div>
                <div className="space-y-1 min-w-0">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-1.5 text-[11px]">
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: cat.color }}
                            />
                            <span className="truncate" style={{ color: C.muted }}>{cat.name}</span>
                            <span className="ml-auto tabular-nums font-semibold" style={{ color: C.text }}>
                                {pct(cat.amount, TOTAL)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {/* TOP3 カード */}
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
                TOP3 で {pct(top3Total, TOTAL)} を占めます
            </div>
            <div className="grid grid-cols-3 gap-2">
                {top3.map((cat, i) => {
                    const Icon = cat.icon;
                    const d = diff(cat.amount, cat.lastMonth);
                    return (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="p-3 text-center"
                            style={{
                                borderRadius: R.inner,
                                background: `color-mix(in srgb, ${cat.color} 8%, white)`,
                                border: `1px solid color-mix(in srgb, ${cat.color} 20%, transparent)`,
                            }}
                        >
                            <div className="mb-1.5 flex justify-center">
                                <Icon size={18} style={{ color: cat.color }} />
                            </div>
                            <div className="text-[10px] font-bold" style={{ color: cat.color }}>{cat.name}</div>
                            <div className="mt-1 font-mono text-[12px] font-extrabold tabular-nums" style={{ color: C.text }}>
                                {yen(cat.amount)}
                            </div>
                            <div
                                className="mt-0.5 text-[9px] font-medium tabular-nums"
                                style={{ color: d > 0 ? C.danger : C.income }}
                            >
                                {d > 0 ? "+" : "−"}¥{Math.abs(d).toLocaleString("ja-JP")}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <Meta
                data={[
                    "全体に占める各カテゴリの比率（円グラフ）",
                    "上位3カテゴリの金額・先月差",
                    "TOP3 が全体の何%を占めるか",
                ]}
                pros={["「何に一番使っているか」が視覚的に強い", "TOP3 に絞ることで意思決定しやすい"]}
                cons={["正確な比率の読み取りは円グラフが苦手", "4位以下の情報が薄くなる"]}
            />
        </div>
    );
}

// ─── メインページ ────────────────────────────────────────────────────────

export function CategoryTopABPrototype() {
    return (
        <div className="min-h-screen pb-16" style={{ background: C.bg }}>
            {/* ヘッダー */}
            <div
                className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b px-4"
                style={{ background: `${C.bg}ee`, backdropFilter: "blur(10px)", borderColor: "rgba(28,20,16,0.10)" }}
            >
                <Link to="/" className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.brand }}>
                    <ChevronLeft size={14} />ギャラリー
                </Link>
                <span className="text-sm font-extrabold" style={{ color: C.text }}>
                    支出カテゴリ TOP — A/B 比較
                </span>
            </div>

            {/* 説明 */}
            <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
                <div
                    className="mb-5 rounded-lg border px-4 py-3 text-xs"
                    style={{ borderColor: C.border, background: C.card, color: C.muted }}
                >
                    「どのカテゴリに何を使っているか」を伝える表示パターン3種の比較。
                    同じデータ（今月の支出カテゴリ別金額 + 先月比）を異なるUIで表現しています。
                </div>

                {/* 3パターン並列 */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {[PatternA, PatternB, PatternC].map((Pattern, i) => (
                        <div
                            key={i}
                            className="border p-5"
                            style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                        >
                            <Pattern />
                        </div>
                    ))}
                </div>

                {/* 比較ナビ */}
                <div className="mt-6 text-center text-xs" style={{ color: C.muted }}>
                    <Link to="/asset-outlook-ab" style={{ color: C.brand }} className="font-semibold hover:underline">
                        長期指標 A/B 比較へ →
                    </Link>
                </div>
            </div>
        </div>
    );
}
