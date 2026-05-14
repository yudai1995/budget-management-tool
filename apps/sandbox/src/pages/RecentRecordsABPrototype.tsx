/**
 * RecentRecordsABPrototype — 最近の記録 レイアウトパターン比較
 *
 * Pattern A: ミニマルリスト（Monzo / Revolut 風）
 * Pattern B: カード型（1行1カード、影で浮かせる）
 * Pattern C: タイムライン（縦ライン＋日付ノード）
 * Pattern D: コンパクトテーブル（銀行明細風）
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ChevronLeft, ChevronRight,
    ShoppingBasket, ShoppingBag, Car, Zap, Tag,
    CircleDollarSign,
} from "lucide-react";

const R = { card: "16px", inner: "10px", badge: "9999px" } as const;
const C = {
    bg: "#fffdf5", card: "#ffffff", text: "#1c1410",
    muted: "rgba(28,20,16,0.42)", mutedLight: "rgba(28,20,16,0.22)",
    border: "rgba(28,20,16,0.08)", borderMid: "rgba(28,20,16,0.12)",
    shadow: "0 1px 3px rgba(28,20,16,0.06), 0 0 0 1px rgba(28,20,16,0.06)",
    shadowMd: "0 4px 16px rgba(28,20,16,0.09), 0 0 0 1px rgba(28,20,16,0.06)",
    brand: "#f18840", brandLight: "#fff6ee",
    income: "#35b5a2", incomeLight: "#ecfaf8",
} as const;

const spring = { type: "spring", stiffness: 380, damping: 28 } as const;

// ─── モックデータ ────────────────────────────────────────────────────────────

const RECORDS = [
    { id: "1", date: "2026-05-15", amount: 1280,  isIncome: false, category: "食費",   content: "スーパー" },
    { id: "2", date: "2026-05-15", amount: 550,   isIncome: false, category: "交通費", content: "電車" },
    { id: "3", date: "2026-05-14", amount: 3200,  isIncome: false, category: "日用品", content: "ドラッグストア" },
    { id: "4", date: "2026-05-14", amount: 800,   isIncome: false, category: "食費",   content: "コンビニ" },
    { id: "5", date: "2026-05-13", amount: 50000, isIncome: true,  category: "給料",   content: "5月給与（一部）" },
    { id: "6", date: "2026-05-12", amount: 20000, isIncome: false, category: "日用品", content: "生活用品まとめ買い" },
];

type Record = typeof RECORDS[number];

const TODAY = "2026-05-15";
const YESTERDAY = "2026-05-14";

function dateLabel(d: string) {
    if (d === TODAY) return "今日";
    if (d === YESTERDAY) return "昨日";
    const dt = new Date(d);
    return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}

function groupByDate(list: Record[]) {
    const map = new Map<string, Record[]>();
    for (const r of list) {
        const arr = map.get(r.date) ?? [];
        arr.push(r);
        map.set(r.date, arr);
    }
    return Array.from(map.entries()).map(([date, items]) => ({
        date,
        label: dateLabel(date),
        items,
        dayTotal: items.filter((r) => !r.isIncome).reduce((s, r) => s + r.amount, 0),
    }));
}

const GROUPED = groupByDate(RECORDS);

function categoryColor(cat: string) {
    if (cat.includes("食"))  return { bg: "#fff6ee", fg: "#f18840" };
    if (cat.includes("日用")) return { bg: "#faf5ff", fg: "#a855f7" };
    if (cat.includes("交通")) return { bg: "#eff6ff", fg: "#3b82f6" };
    if (cat.includes("光熱")) return { bg: "#fefce8", fg: "#ca8a04" };
    if (cat.includes("給") || cat.includes("収")) return { bg: C.incomeLight, fg: C.income };
    return { bg: "rgba(28,20,16,0.06)", fg: C.muted };
}
function categoryIcon(cat: string) {
    if (cat.includes("食"))  return ShoppingBasket;
    if (cat.includes("日用")) return ShoppingBag;
    if (cat.includes("交通")) return Car;
    if (cat.includes("光熱")) return Zap;
    if (cat.includes("給") || cat.includes("収")) return CircleDollarSign;
    return Tag;
}
function yen(n: number) { return `¥${n.toLocaleString("ja-JP")}`; }

// ─── ラベル共通 ────────────────────────────────────────────────────────────

function PatternLabel({ letter, name, desc }: { letter: string; name: string; desc: string }) {
    return (
        <div className="mb-4 flex items-start gap-2.5">
            <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-xs font-extrabold text-white"
                style={{ background: C.text, borderRadius: R.badge }}
            >
                {letter}
            </span>
            <div>
                <div className="text-sm font-bold" style={{ color: C.text }}>{name}</div>
                <div className="text-[11px]" style={{ color: C.muted }}>{desc}</div>
            </div>
        </div>
    );
}

// ─── Pattern A: ミニマルリスト ────────────────────────────────────────────

function PatternA() {
    return (
        <div>
            <PatternLabel
                letter="A"
                name="ミニマルリスト"
                desc="行間を詰め、区切り線をなくす。日付ヘッダーを目立たせる。Monzo / Revolut 風。"
            />
            <div
                className="overflow-hidden"
                style={{ borderRadius: R.card, background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
                    <span className="text-sm font-bold" style={{ color: C.text }}>最近の記録</span>
                    <button type="button" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: C.brand }}>
                        すべて見る <ChevronRight size={12} />
                    </button>
                </div>

                {GROUPED.map((group) => (
                    <div key={group.date}>
                        {/* 日付ヘッダー — 背景色＋右に日計 */}
                        <div
                            className="flex items-center justify-between px-4 py-2"
                            style={{ background: "rgba(28,20,16,0.03)", borderBottom: `1px solid ${C.border}` }}
                        >
                            <span className="text-[12px] font-extrabold tracking-wide" style={{ color: C.text }}>
                                {group.label}
                            </span>
                            <span className="text-[11px] font-semibold tabular-nums" style={{ color: C.muted }}>
                                −{yen(group.dayTotal)}
                            </span>
                        </div>

                        {/* アイテム — 区切り線なし、パディング小 */}
                        {group.items.map((r, i) => {
                            const acc = categoryColor(r.category);
                            const Icon = categoryIcon(r.category);
                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.02] transition-colors"
                                >
                                    <div
                                        className="flex h-8 w-8 shrink-0 items-center justify-center"
                                        style={{ background: acc.bg, borderRadius: "9px" }}
                                    >
                                        <Icon size={14} style={{ color: acc.fg }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold truncate" style={{ color: C.text }}>
                                            {r.content}
                                        </div>
                                        <div className="text-[10px]" style={{ color: C.muted }}>{r.category}</div>
                                    </div>
                                    <div
                                        className="text-[14px] font-bold tabular-nums shrink-0"
                                        style={{ color: r.isIncome ? C.income : C.text, letterSpacing: "-0.01em" }}
                                    >
                                        {r.isIncome ? "+" : "−"}{yen(r.amount)}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Pattern B: カード型 ──────────────────────────────────────────────────

function PatternB() {
    return (
        <div>
            <PatternLabel
                letter="B"
                name="カード型"
                desc="1行1カード。影で浮かせることで各明細が独立して読みやすくなる。"
            />
            <div>
                {/* ヘッダー */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: C.text }}>最近の記録</span>
                    <button type="button" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: C.brand }}>
                        すべて見る <ChevronRight size={12} />
                    </button>
                </div>

                {GROUPED.map((group, gi) => (
                    <div key={group.date} className="mb-3">
                        {/* 日付ラベル — ピル型 */}
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className="px-2.5 py-0.5 text-[11px] font-bold"
                                style={{
                                    background: C.text,
                                    color: "#fff",
                                    borderRadius: R.badge,
                                }}
                            >
                                {group.label}
                            </span>
                            <span className="text-[11px] tabular-nums" style={{ color: C.muted }}>
                                合計 −{yen(group.dayTotal)}
                            </span>
                        </div>

                        {/* カードリスト */}
                        <div className="space-y-2">
                            {group.items.map((r, i) => {
                                const acc = categoryColor(r.category);
                                const Icon = categoryIcon(r.category);
                                return (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...spring, delay: gi * 0.05 + i * 0.05 }}
                                        className="flex items-center gap-3 px-4 py-3"
                                        style={{
                                            background: C.card,
                                            borderRadius: R.inner,
                                            boxShadow: C.shadow,
                                            border: `1px solid ${C.border}`,
                                        }}
                                    >
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center"
                                            style={{ background: acc.bg, borderRadius: "10px" }}
                                        >
                                            <Icon size={18} style={{ color: acc.fg }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[14px] font-bold truncate" style={{ color: C.text }}>
                                                {r.content}
                                            </div>
                                            <div
                                                className="mt-0.5 inline-block px-1.5 py-0 text-[10px] font-semibold"
                                                style={{
                                                    background: acc.bg,
                                                    color: acc.fg,
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                {r.category}
                                            </div>
                                        </div>
                                        <div
                                            className="text-[16px] font-extrabold tabular-nums shrink-0"
                                            style={{ color: r.isIncome ? C.income : C.text, letterSpacing: "-0.02em" }}
                                        >
                                            {r.isIncome ? "+" : "−"}{yen(r.amount)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Pattern C: タイムライン ──────────────────────────────────────────────

function PatternC() {
    return (
        <div>
            <PatternLabel
                letter="C"
                name="タイムライン"
                desc="縦ライン＋日付ノードで時系列を視覚化。家計簿らしさと記録感を両立。"
            />

            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: C.text }}>最近の記録</span>
                <button type="button" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: C.brand }}>
                    すべて見る <ChevronRight size={12} />
                </button>
            </div>

            <div className="relative pl-8">
                {/* 縦ライン */}
                <div
                    className="absolute left-3 top-3 bottom-3 w-px"
                    style={{ background: `linear-gradient(to bottom, ${C.brand}60, ${C.mutedLight})` }}
                />

                {GROUPED.map((group, gi) => (
                    <div key={group.date} className="mb-5 relative">
                        {/* 日付ノード */}
                        <div className="flex items-center gap-3 mb-2 relative">
                            <div
                                className="absolute -left-8 flex h-6 w-6 items-center justify-center"
                                style={{
                                    background: gi === 0 ? C.brand : C.card,
                                    border: `2px solid ${gi === 0 ? C.brand : C.borderMid}`,
                                    borderRadius: R.badge,
                                    boxShadow: gi === 0 ? "0 0 0 3px rgba(241,136,64,0.15)" : "none",
                                }}
                            >
                                {gi === 0 && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span
                                className="text-[12px] font-extrabold"
                                style={{ color: gi === 0 ? C.brand : C.text }}
                            >
                                {group.label}
                            </span>
                            <span className="text-[10px] tabular-nums" style={{ color: C.muted }}>
                                −{yen(group.dayTotal)}
                            </span>
                        </div>

                        {/* アイテム */}
                        <div className="space-y-1.5">
                            {group.items.map((r, i) => {
                                const acc = categoryColor(r.category);
                                const Icon = categoryIcon(r.category);
                                return (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ ...spring, delay: gi * 0.04 + i * 0.04 }}
                                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                                        style={{
                                            background: C.card,
                                            border: `1px solid ${C.border}`,
                                            boxShadow: "0 1px 2px rgba(28,20,16,0.04)",
                                        }}
                                    >
                                        <div
                                            className="flex h-7 w-7 shrink-0 items-center justify-center"
                                            style={{ background: acc.bg, borderRadius: "8px" }}
                                        >
                                            <Icon size={13} style={{ color: acc.fg }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[13px] font-semibold" style={{ color: C.text }}>
                                                {r.content}
                                            </span>
                                            <span className="ml-1.5 text-[10px]" style={{ color: C.muted }}>
                                                {r.category}
                                            </span>
                                        </div>
                                        <div
                                            className="text-[13px] font-bold tabular-nums shrink-0"
                                            style={{ color: r.isIncome ? C.income : C.text }}
                                        >
                                            {r.isIncome ? "+" : "−"}{yen(r.amount)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Pattern D: コンパクトテーブル（銀行明細風）──────────────────────────

function PatternD() {
    return (
        <div>
            <PatternLabel
                letter="D"
                name="コンパクトテーブル"
                desc="最大密度。銀行明細・マネーフォワード的なスキャン重視レイアウト。"
            />
            <div
                className="overflow-hidden"
                style={{ borderRadius: R.card, background: C.card, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
                    <span className="text-sm font-bold" style={{ color: C.text }}>最近の記録</span>
                    <button type="button" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: C.brand }}>
                        すべて見る <ChevronRight size={12} />
                    </button>
                </div>

                {/* カラムヘッダー */}
                <div
                    className="grid px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        gridTemplateColumns: "1fr 60px auto",
                        gap: "0 8px",
                        background: "rgba(28,20,16,0.02)",
                        color: C.muted,
                        borderBottom: `1px solid ${C.border}`,
                    }}
                >
                    <span>内容</span>
                    <span>カテゴリ</span>
                    <span className="text-right">金額</span>
                </div>

                {GROUPED.map((group) => (
                    <div key={group.date}>
                        {/* 日付区切り — スリム */}
                        <div
                            className="flex items-center justify-between px-4 py-1"
                            style={{
                                background: "rgba(28,20,16,0.025)",
                                borderBottom: `1px solid ${C.border}`,
                                borderTop: `1px solid ${C.border}`,
                            }}
                        >
                            <span className="text-[11px] font-bold" style={{ color: C.text }}>{group.label}</span>
                            <span className="text-[10px] tabular-nums font-semibold" style={{ color: C.muted }}>
                                支出 −{yen(group.dayTotal)}
                            </span>
                        </div>

                        {group.items.map((r, i) => {
                            const acc = categoryColor(r.category);
                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="grid items-center px-4 py-2 hover:bg-black/[0.015] transition-colors"
                                    style={{
                                        gridTemplateColumns: "1fr 60px auto",
                                        gap: "0 8px",
                                        borderBottom: i < group.items.length - 1 ? `1px solid ${C.border}` : "none",
                                    }}
                                >
                                    {/* 内容 */}
                                    <div className="min-w-0 flex items-center gap-2">
                                        <div
                                            className="shrink-0 h-1.5 w-1.5 rounded-full"
                                            style={{ background: acc.fg }}
                                        />
                                        <span className="text-[13px] font-medium truncate" style={{ color: C.text }}>
                                            {r.content}
                                        </span>
                                    </div>

                                    {/* カテゴリ */}
                                    <span
                                        className="truncate text-[11px] font-medium"
                                        style={{ color: acc.fg }}
                                    >
                                        {r.category}
                                    </span>

                                    {/* 金額 */}
                                    <span
                                        className="text-[13px] font-bold tabular-nums text-right shrink-0"
                                        style={{ color: r.isIncome ? C.income : C.text, letterSpacing: "-0.01em" }}
                                    >
                                        {r.isIncome ? "+" : "−"}{yen(r.amount)}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── メインページ ────────────────────────────────────────────────────────────

export function RecentRecordsABPrototype() {
    return (
        <div className="min-h-screen pb-16" style={{ background: C.bg }}>
            {/* ヘッダー */}
            <div
                className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b px-4"
                style={{
                    background: "rgba(255,253,245,0.88)",
                    backdropFilter: "blur(20px)",
                    borderColor: C.border,
                }}
            >
                <Link to="/" className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.brand }}>
                    <ChevronLeft size={14} />ギャラリー
                </Link>
                <span className="text-sm font-extrabold" style={{ color: C.text }}>
                    最近の記録 — レイアウト比較
                </span>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
                <div
                    className="mb-5 rounded-xl border px-4 py-3 text-xs"
                    style={{ borderColor: C.border, background: C.card, color: C.muted }}
                >
                    同じデータ（6件の支出・収入）を4パターンで表示比較します。
                    モバイルで見やすさ・スキャンしやすさを確認してください。
                </div>

                {/* 2カラムグリッド (lg以上) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div
                        className="border p-5"
                        style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                    >
                        <PatternA />
                    </div>
                    <div
                        className="border p-5"
                        style={{ borderRadius: R.card, background: C.bg, borderColor: C.border, boxShadow: C.shadow }}
                    >
                        <PatternB />
                    </div>
                    <div
                        className="border p-5"
                        style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                    >
                        <PatternC />
                    </div>
                    <div
                        className="border p-5"
                        style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                    >
                        <PatternD />
                    </div>
                </div>

                {/* 比較ポイント */}
                <div
                    className="mt-6 overflow-x-auto border rounded-xl"
                    style={{ background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                >
                    <table className="w-full text-[12px]">
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                {["", "A: ミニマル", "B: カード型", "C: タイムライン", "D: テーブル"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: C.muted, whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: "1画面の表示数", vals: ["多い", "中", "中", "最多"] },
                                { label: "日付の見やすさ", vals: ["◎ 背景色で明確", "◎ ピルで明確", "◎ ノードで直感的", "△ 細い"] },
                                { label: "金額の見やすさ", vals: ["○", "◎ 大きい", "○", "○"] },
                                { label: "スキャン速度",   vals: ["速い", "やや遅い", "中", "最速"] },
                                { label: "記録感・温かみ", vals: ["△ 無機質", "○", "◎", "△ 銀行的"] },
                                { label: "モバイル適性",   vals: ["◎", "○ 縦長", "◎", "◎"] },
                            ].map((row) => (
                                <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: C.muted }}>{row.label}</td>
                                    {row.vals.map((v, i) => (
                                        <td key={i} className="px-4 py-2.5" style={{ color: C.text }}>{v}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-center text-xs" style={{ color: C.muted }}>
                    <Link to="/home-v4" style={{ color: C.brand }} className="font-semibold hover:underline">← V4 ダッシュボードに戻る</Link>
                </div>
            </div>
        </div>
    );
}
