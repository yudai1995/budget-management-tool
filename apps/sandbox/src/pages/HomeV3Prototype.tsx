/**
 * HomeV3Prototype — ホーム画面 V3 デザイン モックアップ
 *
 * ─ サンドボックス専用 ─
 * - すべてのデータはモック（API 呼び出しなし）
 * - フォーム送信はコンソール出力のみ
 * - Next.js / Server Actions 依存なし
 * - 改修する場合はこのファイルを自由に編集してください
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, motion } from "framer-motion";
import { Drawer } from "vaul";
import {
    Home,
    Calendar,
    BarChart2,
    Settings,
    Bell,
    Plus,
    Check,
    Receipt,
    Wallet,
    Banknote,
    ShoppingBasket,
    ShoppingBag,
    CircleDollarSign,
    Info,
    Flame,
    AlertTriangle,
    TrendingDown,
    X,
} from "lucide-react";

// ─── デザイントークン（本実装 globals.css / figma-tokens に準拠）────────

/** カードの角丸 (= --radius-card 相当を rounded-xl に抑制) */
const R = {
    card: "12px",      // rounded-xl — カード外枠
    inner: "8px",      // rounded-lg  — カード内タイル
    badge: "9999px",   // rounded-full — バッジ・ドット
    input: "10px",     // 入力欄
} as const;

const C = {
    /* ── ベース ── */
    bg: "#fffdf5",          // --background (= --color-surface-subtle)
    card: "#ffffff",         // --color-surface-default
    text: "#1c1410",         // --foreground
    muted: "rgba(28,20,16,0.45)",
    border: "#e8c8b0",       // --border-default
    shadow: "0 1px 4px 0 rgba(28,20,16,0.07), 0 0 0 1px rgba(28,20,16,0.06)", // --shadow-card
    shadowPop: "1px 1px 0 0 #1c1410",  // --shadow-pop-sm

    /* ── ブランド ── */
    brand: "#f18840",        // --color-brand-primary
    brandLight: "#fff6ee",   // --color-expense-light
    brandSecondary: "#e07030",

    /* ── 収支 ── */
    income: "#35b5a2",       // --color-income
    incomeLight: "#ecfaf8",  // --color-income-light
    expense: "#f18840",      // --color-expense
    expenseLight: "#fff6ee",

    /* ── ピンチ度（本実装 DailyBudgetCard Pattern D 準拠）── */
    safe:        { bg: "#fafaf8", border: "#c4b5a5", hero: "#6b5b52", badge: "#c4b5a5", label: "余裕" },
    caution:     { bg: "#fef2f2", border: "#f87171", hero: "#b91c1c", badge: "#f87171", label: "注意" },
    danger:      { bg: "#fff1f2", border: "#f43f5e", hero: "#9f1239", badge: "#f43f5e", label: "ピンチ" },
} as const;

// ─── モックデータ（ここを変えるとプレビューが変わる）────────────────────

const MOCK = {
    userId: "Y",
    todayExpense: 1280,
    yesterdayExpense: 3200,
    zeroStreakDays: 2,
    avgDailyExpense: 9800,   // 月約29.4万 (月収25.3万を上回るため純支出が発生)
    recordedDays: 6,
    recordingStreak: 6,
    totalAssets: 999853,
    monthlyIncome: 252600,
    dailyBudget: 7692,       // 残予算10万円 ÷ 残13日
    daysUntilPayday: 13,
    monthSummary: {
        label: "2026 / 05",
        expense: 148700,
        income: 252600,
    },
    recentExpenses: [
        { id: "1", date: "2026-05-12", amount: 1280,  balanceType: 0, categoryName: "食費",   content: "スーパー" },
        { id: "2", date: "2026-05-11", amount: 20000, balanceType: 0, categoryName: "日用品", content: "生活用品" },
        { id: "3", date: "2026-05-10", amount: 50000, balanceType: 1, categoryName: "給料",   content: "5月給与" },
    ],
    alerts: [
        { id: "a1", type: "caution" as const, message: "今月の食費が先月比 +23% です" },
        { id: "a2", type: "danger"  as const, message: "固定費の引き落とし予定日まで3日" },
    ],
};

// ─── カテゴリ定義 ─────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
    { id: 1, name: "食費" },
    { id: 2, name: "日用品" },
    { id: 3, name: "交通費" },
    { id: 4, name: "娯楽費" },
    { id: 5, name: "光熱費" },
    { id: 6, name: "医療費" },
    { id: 7, name: "その他" },
];

// ─── 計算ユーティリティ ───────────────────────────────────────────────────

function calcDaysRemaining(assets: number, netDailyExpense: number): number | null {
    if (netDailyExpense <= 0) return null;
    return Math.floor(assets / netDailyExpense);
}

function formatLifespan(daysRemaining: number | null) {
    if (daysRemaining === null)
        return { infinite: true,  months: 0, days: 0, subLabel: "収入が支出をカバーしています" };
    if (daysRemaining <= 0)
        return { infinite: false, months: 0, days: 0, subLabel: "資産の状況を確認しましょう" };
    const d = Math.floor(daysRemaining);
    return {
        infinite: false,
        months: Math.floor(d / 30),
        days: d % 30,
        subLabel: `${d.toLocaleString("ja-JP")} 日後にゼロ — 今のペースを続けた場合`,
    };
}

function lifespanAccent(monthsApprox: number): string {
    if (monthsApprox > 12) return C.income;
    if (monthsApprox > 4)  return C.brand;
    return C.danger.badge;
}

// ─── ヘルパー ─────────────────────────────────────────────────────────────

function formatYen(n: number)       { return `¥${Math.round(n).toLocaleString("ja-JP")}` }
function formatYenSigned(n: number) {
    return `${n >= 0 ? "+" : "−"}¥${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;
}

type Tone = "safe" | "caution" | "danger";

function budgetTone(ratio: number): Tone {
    if (ratio >= 0.8) return "safe";
    if (ratio >= 0.2) return "caution";
    return "danger";
}

function categoryIcon(name: string) {
    if (name.includes("食"))                            return ShoppingBasket;
    if (name.includes("日用品") || name.includes("生活")) return ShoppingBag;
    if (name.includes("給") || name.includes("収"))      return CircleDollarSign;
    return ShoppingBasket;
}

function categoryAccent(name: string) {
    if (name.includes("食"))
        return { bg: C.expenseLight,  fg: C.expense };
    if (name.includes("日用品") || name.includes("生活"))
        return { bg: "color-mix(in srgb, #a855f7 12%, white)", fg: "#a855f7" };
    if (name.includes("給") || name.includes("収"))
        return { bg: C.incomeLight, fg: C.income };
    return { bg: "rgba(28,20,16,0.07)", fg: C.muted };
}

// ─── アニメーション付き数値 ───────────────────────────────────────────────

function useAnimatedNumber(value: number, format: (n: number) => string): string {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);
    useEffect(() => {
        const from = prev.current;
        const ctrl = animate(from, value, {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(v),
        });
        prev.current = value;
        return () => ctrl.stop();
    }, [value]);
    return format(display);
}

// ─── SetupModal ───────────────────────────────────────────────────────────

function SetupModal({
    defaultAssets, defaultIncome,
    onSave, onClose,
}: {
    defaultAssets?: number;
    defaultIncome: number;
    onSave: (assets: number, income: number) => void;
    onClose?: () => void;
}) {
    const [assets, setAssets] = useState(String(defaultAssets ?? ""));
    const [income, setIncome] = useState(String(defaultIncome || ""));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(28,20,16,0.50)" }}
        >
            <div
                className="relative mx-4 w-full max-w-sm p-6"
                style={{ background: C.card, borderRadius: R.card, border: `1px solid ${C.border}` }}
            >
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center transition-colors hover:bg-black/5"
                        style={{ color: C.muted, borderRadius: R.inner }}
                        aria-label="閉じる"
                    >
                        <X size={16} />
                    </button>
                )}
                <h2 className="mb-1 text-base font-extrabold" style={{ color: C.text }}>初期設定</h2>
                <p className="mb-5 text-sm" style={{ color: C.muted }}>現在の資産と月収を入力してください</p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const a = Number(assets), i = Number(income);
                        if (!a || !i) return;
                        onSave(a, i);
                    }}
                    className="space-y-4"
                >
                    {[
                        { id: "s-assets", label: "現在の総資産（円）", val: assets, set: setAssets, ph: "例: 500000" },
                        { id: "s-income", label: "月収（手取り、円）",  val: income, set: setIncome, ph: "例: 280000" },
                    ].map((f) => (
                        <div key={f.id} className="space-y-1.5">
                            <label
                                className="text-xs font-semibold"
                                style={{ color: C.muted }}
                                htmlFor={f.id}
                            >{f.label}</label>
                            <input
                                id={f.id}
                                type="number" inputMode="numeric" min={0} required
                                value={f.val}
                                onChange={(e) => f.set(e.target.value)}
                                className="flex h-10 w-full px-3 text-sm font-bold tabular-nums outline-none"
                                style={{
                                    border: `2px solid ${C.border}`,
                                    borderRadius: R.input,
                                    background: C.bg,
                                    color: C.text,
                                }}
                                placeholder={f.ph}
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: C.brand, borderRadius: R.input }}
                    >
                        設定する
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── メインコンポーネント ─────────────────────────────────────────────────

export function HomeV3Prototype() {
    const [totalAssets, setTotalAssets] = useState<number | null>(MOCK.totalAssets);
    const [monthlyIncome, setMonthlyIncome] = useState(MOCK.monthlyIncome);
    const [showSetup, setShowSetup]   = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [amountStr, setAmountStr]   = useState("");
    const [categoryId, setCategoryId] = useState("1");
    const [noteText, setNoteText]     = useState("");
    const [submitted, setSubmitted]   = useState(false);
    const [alerts, setAlerts]         = useState(MOCK.alerts);

    const netDailyExpense = Math.max(0, MOCK.avgDailyExpense - monthlyIncome / 30);
    const daysRemaining   = totalAssets !== null
        ? calcDaysRemaining(totalAssets, netDailyExpense)
        : null;

    // 今日使えるお金
    const remaining = Math.max(0, MOCK.dailyBudget - MOCK.todayExpense);
    const animatedRemaining = useAnimatedNumber(remaining, formatYen);
    const ratio   = MOCK.dailyBudget > 0 ? remaining / MOCK.dailyBudget : 1;
    const tone    = budgetTone(ratio);
    const fillPct = Math.round(Math.max(0, Math.min(100, ratio * 100)));
    const ps      = C[tone]; // PINCH_STYLES

    // 家計の寿命
    const lm            = useMemo(() => formatLifespan(daysRemaining), [daysRemaining]);
    const monthsApprox  = daysRemaining !== null ? daysRemaining / 30 : 999;
    const lsAccent      = lifespanAccent(monthsApprox);

    const netMonth = MOCK.monthSummary.income - MOCK.monthSummary.expense;

    function handleExpenseSubmit(e: React.FormEvent) {
        e.preventDefault();
        const amount = Number(amountStr);
        if (!amount) return;
        console.log("[モック] 支出記録:", { amount, categoryId, note: noteText });
        setSubmitted(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setAmountStr("");
            setNoteText("");
            setSubmitted(false);
        }, 600);
    }

    return (
        <div
            className="min-h-screen pb-28"
            style={{ background: C.bg, color: C.text }}
        >
            {showSetup && (
                <SetupModal
                    defaultAssets={totalAssets ?? undefined}
                    defaultIncome={monthlyIncome}
                    onSave={(a, i) => { setTotalAssets(a); setMonthlyIncome(i); setShowSetup(false); }}
                    onClose={totalAssets !== null ? () => setShowSetup(false) : undefined}
                />
            )}

            {/* ─── ヘッダー ─────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-20 flex h-14 items-center border-b px-4 md:px-6"
                style={{
                    background: `${C.bg}ee`,
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(28,20,16,0.10)",
                }}
            >
                {/* ロゴ */}
                <div className="flex items-center gap-2 shrink-0">
                    <img
                        src="/logo192.png"
                        alt="家計かんり"
                        className="h-8 w-8 shrink-0"
                        style={{ borderRadius: "10px" }}
                    />
                    <span className="text-sm font-extrabold" style={{ color: C.text }}>
                        家計かんり
                    </span>
                </div>

                {/* センターナビ（PC のみ） */}
                <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
                    {[
                        { to: "/home-v3",   label: "ホーム",       icon: Home,     active: true },
                        { to: "#",          label: "カレンダー",   icon: Calendar,  active: false },
                        { to: "#",          label: "レポート",     icon: BarChart2, active: false },
                        { to: "#",          label: "設定",         icon: Settings,  active: false },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold transition-colors"
                            style={{
                                borderRadius: "10px",
                                background: item.active ? C.brandLight : "transparent",
                                color:      item.active ? C.brand      : "rgba(28,20,16,0.60)",
                            }}
                        >
                            <item.icon size={14} aria-hidden />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* 右アクション */}
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <button
                        type="button"
                        className="relative flex h-8 w-8 items-center justify-center transition-colors hover:bg-black/5"
                        style={{ color: "rgba(28,20,16,0.50)", borderRadius: "8px" }}
                        aria-label="通知"
                    >
                        <Bell size={17} />
                        {alerts.length > 0 && (
                            <span
                                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                                style={{ background: C.brand }}
                            />
                        )}
                    </button>
                    <div
                        className="flex h-8 w-8 items-center justify-center text-[12px] font-extrabold text-white"
                        style={{
                            background: C.brand,
                            borderRadius: R.badge,
                        }}
                    >
                        {MOCK.userId}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-3 px-4 py-4 md:px-6 md:py-5">

                {/* ─── アラートバナー ──────────────────────────────────────── */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        {alerts.map((alert) => {
                            const aColor = alert.type === "danger" ? C.danger.badge : C.caution.badge;
                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2.5 border px-3.5 py-2.5"
                                    style={{
                                        borderRadius: R.inner,
                                        borderColor: `color-mix(in srgb, ${aColor} 30%, transparent)`,
                                        background: `color-mix(in srgb, ${aColor} 6%, white)`,
                                    }}
                                >
                                    {alert.type === "danger"
                                        ? <TrendingDown size={13} style={{ color: aColor, flexShrink: 0 }} />
                                        : <AlertTriangle size={13} style={{ color: aColor, flexShrink: 0 }} />
                                    }
                                    <span className="flex-1 text-xs font-medium" style={{ color: C.text + "cc" }}>
                                        {alert.message}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                                        className="shrink-0 transition-opacity hover:opacity-60"
                                        style={{ color: C.muted }}
                                        aria-label="閉じる"
                                    >
                                        <X size={13} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* ─── メイングリッド ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_288px] lg:items-start">

                    {/* 左カラム */}
                    <div className="space-y-3">

                        {/* ── 今日使えるお金 ───────────────────────────────── */}
                        <div
                            className="border-2 p-5"
                            style={{
                                borderRadius: R.card,
                                background: ps.bg,
                                borderColor: ps.border,
                                boxShadow: C.shadow,
                            }}
                        >
                            {/* ヘッダー行 */}
                            <div className="mb-3 flex items-center justify-between">
                                <span
                                    className="text-xs font-bold uppercase tracking-wide"
                                    style={{ color: "rgba(28,20,16,0.60)" }}
                                >
                                    今日使えるお金
                                </span>
                                <span
                                    className="px-2.5 py-0.5 text-xs font-bold text-white"
                                    style={{ background: ps.badge, borderRadius: R.badge }}
                                >
                                    {ps.label}
                                </span>
                            </div>

                            {/* ヒーローナンバー */}
                            <div className="mb-4">
                                <p
                                    className="text-4xl font-extrabold leading-none tabular-nums md:text-5xl"
                                    style={{ color: ps.hero }}
                                >
                                    {animatedRemaining}
                                </p>
                            </div>

                            {/* プログレスバー */}
                            <div className="mb-3.5">
                                <div
                                    className="mb-1 flex justify-between text-[11px] font-medium"
                                    style={{ color: "rgba(28,20,16,0.50)" }}
                                >
                                    <span>残り</span>
                                    <span className="tabular-nums">{fillPct}%</span>
                                </div>
                                <div
                                    className="h-1.5 overflow-hidden"
                                    style={{ background: `color-mix(in srgb, ${ps.border} 30%, transparent)`, borderRadius: R.badge }}
                                >
                                    <motion.div
                                        className="h-full"
                                        style={{ background: ps.hero, borderRadius: R.badge }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fillPct}%` }}
                                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                </div>
                            </div>

                            {/* メタ行 */}
                            <div
                                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                                style={{ color: "rgba(28,20,16,0.60)" }}
                            >
                                <span>
                                    1日予算{" "}
                                    <span className="font-bold tabular-nums" style={{ color: "rgba(28,20,16,0.80)" }}>
                                        {formatYen(MOCK.dailyBudget)}
                                    </span>
                                </span>
                                <span style={{ color: "rgba(28,20,16,0.25)" }}>|</span>
                                <span>
                                    本日支出{" "}
                                    <span className="font-bold tabular-nums" style={{ color: "rgba(28,20,16,0.80)" }}>
                                        {formatYen(MOCK.todayExpense)}
                                    </span>
                                </span>
                            </div>

                            {/* 給料日カウントダウン */}
                            <div
                                className="mt-3 flex items-center gap-1.5 border-t pt-3"
                                style={{ borderColor: `${ps.border}40` }}
                            >
                                <span
                                    className="inline-block h-1.5 w-1.5 rounded-full"
                                    style={{ background: ps.hero }}
                                />
                                <span className="text-xs" style={{ color: "rgba(28,20,16,0.60)" }}>
                                    給料日まで{" "}
                                    <span className="font-bold" style={{ color: "rgba(28,20,16,0.80)" }}>
                                        あと {MOCK.daysUntilPayday} 日
                                    </span>
                                </span>
                            </div>

                            {/* ステータスメッセージ */}
                            <div
                                className="mt-2.5 flex items-center gap-1.5 text-xs font-medium"
                                style={{ color: "rgba(28,20,16,0.50)" }}
                            >
                                <Info size={12} className="shrink-0" />
                                {tone === "safe"
                                    ? "今日は支出をコントロールできています"
                                    : tone === "caution"
                                        ? "予算の大半を使いました。支出を見直しましょう"
                                        : "本日の予算が底をつきそうです。一度立ち止まりましょう"
                                }
                            </div>
                        </div>

                        {/* ── 家計の寿命 ───────────────────────────────────── */}
                        {totalAssets === null ? (
                            <div
                                className="border-2 border-dashed p-5 text-center"
                                style={{ borderRadius: R.card, borderColor: C.border, background: C.card }}
                            >
                                <p className="mb-3 text-sm font-medium" style={{ color: C.muted }}>
                                    設定を完了すると「家計の寿命」が表示されます
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowSetup(true)}
                                    className="px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                                    style={{ background: C.brand, borderRadius: R.input }}
                                >
                                    設定する
                                </button>
                            </div>
                        ) : (
                            <div
                                className="border p-5"
                                style={{
                                    borderRadius: R.card,
                                    background: C.card,
                                    borderColor: C.border,
                                    boxShadow: C.shadow,
                                }}
                            >
                                {/* ヘッダー行 */}
                                <div className="mb-1 flex items-center justify-between">
                                    <span
                                        className="text-xs font-bold uppercase tracking-wide"
                                        style={{ color: "rgba(28,20,16,0.50)" }}
                                    >
                                        家計の寿命
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowSetup(true)}
                                        className="text-[11px] font-semibold transition-opacity hover:opacity-70"
                                        style={{ color: C.brand }}
                                    >
                                        設定変更
                                    </button>
                                </div>

                                {/* 寿命メイン */}
                                <div className="py-5 text-center md:py-7">
                                    {lm.infinite ? (
                                        <>
                                            <div className="text-5xl font-extrabold" style={{ color: C.income }}>∞</div>
                                            <div className="mt-2 text-xs font-medium" style={{ color: C.muted }}>{lm.subLabel}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-baseline justify-center gap-1">
                                                <span className="text-base font-semibold" style={{ color: "rgba(28,20,16,0.55)" }}>あと</span>
                                                <motion.span
                                                    key={`m-${lm.months}`}
                                                    className="font-mono text-5xl font-black tabular-nums tracking-tight md:text-6xl"
                                                    style={{ color: lsAccent }}
                                                    initial={{ opacity: 0.5, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {lm.months}
                                                </motion.span>
                                                <span className="text-xl font-bold md:text-2xl" style={{ color: lsAccent }}>ヶ月</span>
                                                <motion.span
                                                    key={`d-${lm.days}`}
                                                    className="font-mono text-4xl font-black tabular-nums tracking-tight md:text-5xl"
                                                    style={{ color: lsAccent }}
                                                    initial={{ opacity: 0.5, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {lm.days}
                                                </motion.span>
                                                <span className="text-xl font-bold md:text-2xl" style={{ color: lsAccent }}>日</span>
                                            </div>
                                            <div className="mt-2 text-xs font-medium" style={{ color: C.muted }}>
                                                {lm.subLabel}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* スタットグリッド */}
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                    {[
                                        { label: "残存資産", value: formatYen(totalAssets), highlight: "" },
                                        { label: "1日あたり", value: formatYen(Math.round(netDailyExpense)), sub: `${Math.round(netDailyExpense / 1000 * 60 * 24 / 60)}分 / 1,000円` },
                                        {
                                            label: "今日",
                                            value: formatYen(MOCK.todayExpense),
                                            highlight: MOCK.todayExpense === 0 ? C.income : C.expense,
                                            tileBg: MOCK.todayExpense === 0 ? C.incomeLight : undefined,
                                        },
                                        { label: "昨日", value: formatYen(MOCK.yesterdayExpense), highlight: "" },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="px-3 py-3"
                                            style={{
                                                background: item.tileBg ?? C.bg,
                                                borderRadius: R.inner,
                                            }}
                                        >
                                            <div
                                                className="mb-1 text-[10px] font-bold uppercase tracking-wide"
                                                style={{ color: C.muted }}
                                            >
                                                {item.label}
                                            </div>
                                            <div
                                                className="font-mono text-[16px] font-extrabold tabular-nums"
                                                style={{ color: item.highlight || C.text }}
                                            >
                                                {item.value}
                                            </div>
                                            {"sub" in item && item.sub && (
                                                <div className="mt-0.5 text-[10px]" style={{ color: C.muted }}>
                                                    {item.sub}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* 予測精度バー */}
                                <div className="mt-4 border-t pt-3.5" style={{ borderColor: C.border }}>
                                    <div
                                        className="mb-2 flex justify-between text-[10.5px] font-bold uppercase tracking-wide"
                                        style={{ color: C.muted }}
                                    >
                                        <span>予測の精度</span>
                                        <span>{MOCK.recordedDays}日分の実績</span>
                                    </div>
                                    <div
                                        className="h-1 overflow-hidden"
                                        style={{ background: C.bg, borderRadius: R.badge }}
                                    >
                                        <motion.div
                                            className="h-full"
                                            style={{ background: C.brand, borderRadius: R.badge }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (MOCK.recordedDays / 90) * 100)}%` }}
                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </div>
                                </div>

                                {/* ゼロ連続ストリーク */}
                                {MOCK.zeroStreakDays >= 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mt-3 flex items-center gap-2 p-3"
                                        style={{
                                            background: C.incomeLight,
                                            borderRadius: R.inner,
                                        }}
                                    >
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ background: C.income }}
                                        />
                                        <span className="text-xs font-semibold" style={{ color: C.income }}>
                                            {MOCK.zeroStreakDays}日連続で支出ゼロ — 着実に余裕が積み上がっています
                                        </span>
                                    </motion.div>
                                )}

                                {/* 記録ストリーク（ゼロ連続がない場合） */}
                                {MOCK.recordingStreak >= 2 && MOCK.zeroStreakDays < 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mt-3 flex items-center gap-2 px-3 py-2"
                                        style={{
                                            background: C.brandLight,
                                            borderRadius: R.inner,
                                        }}
                                    >
                                        <Flame size={14} style={{ color: C.brand }} />
                                        <span className="text-xs font-semibold" style={{ color: C.brand }}>
                                            {MOCK.recordingStreak}日連続記録中
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 右カラム */}
                    <div className="space-y-3">

                        {/* ── 月の収支 ─────────────────────────────────────── */}
                        <div
                            className="border p-4"
                            style={{
                                borderRadius: R.card,
                                background: C.card,
                                borderColor: C.border,
                                boxShadow: C.shadow,
                            }}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-bold" style={{ color: C.text }}>月の収支</span>
                                <span className="font-mono text-[11px]" style={{ color: C.muted }}>
                                    {MOCK.monthSummary.label}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {/* 支出 */}
                                <div
                                    className="p-3"
                                    style={{ background: C.expenseLight, borderRadius: R.inner }}
                                >
                                    <div className="mb-1.5 flex items-center gap-1">
                                        <Receipt size={10} style={{ color: C.expense }} />
                                        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: C.expense }}>支出</span>
                                    </div>
                                    <div className="font-mono text-[14px] font-extrabold tabular-nums" style={{ color: C.expense }}>
                                        {formatYen(MOCK.monthSummary.expense)}
                                    </div>
                                </div>
                                {/* 収入 */}
                                <div
                                    className="p-3"
                                    style={{ background: C.incomeLight, borderRadius: R.inner }}
                                >
                                    <div className="mb-1.5 flex items-center gap-1">
                                        <Banknote size={10} style={{ color: C.income }} />
                                        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: C.income }}>収入</span>
                                    </div>
                                    <div className="font-mono text-[14px] font-extrabold tabular-nums" style={{ color: C.income }}>
                                        {formatYen(MOCK.monthSummary.income)}
                                    </div>
                                </div>
                                {/* 残り */}
                                <div className="p-3" style={{ background: C.bg, borderRadius: R.inner }}>
                                    <div className="mb-1.5 flex items-center gap-1">
                                        <Wallet size={10} style={{ color: C.muted }} />
                                        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>残り</span>
                                    </div>
                                    <div
                                        className="font-mono text-[14px] font-extrabold tabular-nums"
                                        style={{ color: netMonth >= 0 ? C.income : C.danger.badge }}
                                    >
                                        {formatYenSigned(netMonth)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 最近の記録 ───────────────────────────────────── */}
                        <div
                            className="border p-4"
                            style={{
                                borderRadius: R.card,
                                background: C.card,
                                borderColor: C.border,
                                boxShadow: C.shadow,
                            }}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-bold" style={{ color: C.text }}>最近の記録</span>
                                <span
                                    className="cursor-pointer text-[11px] font-semibold transition-opacity hover:opacity-70"
                                    style={{ color: C.brand }}
                                >
                                    すべて見る ›
                                </span>
                            </div>
                            <ul>
                                {MOCK.recentExpenses.map((it, i) => {
                                    const acc = categoryAccent(it.categoryName);
                                    const Icon = categoryIcon(it.categoryName);
                                    const isIncome = it.balanceType === 1;
                                    const title = it.content?.trim() || it.categoryName;
                                    return (
                                        <motion.li
                                            key={it.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="flex items-center gap-3 py-2.5"
                                            style={{
                                                borderBottom: i < MOCK.recentExpenses.length - 1
                                                    ? `1px solid ${C.border}`
                                                    : "none",
                                            }}
                                        >
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center"
                                                style={{ background: acc.bg, color: acc.fg, borderRadius: R.inner }}
                                            >
                                                <Icon size={15} aria-hidden />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div
                                                    className="truncate text-[13px] font-semibold"
                                                    style={{ color: C.text }}
                                                >
                                                    {title}
                                                </div>
                                                <div className="text-[11px] tabular-nums" style={{ color: C.muted }}>
                                                    {it.date} · {it.categoryName}
                                                </div>
                                            </div>
                                            <div
                                                className="shrink-0 font-mono text-[13px] font-extrabold tabular-nums"
                                                style={{ color: isIncome ? C.income : C.text }}
                                            >
                                                {isIncome ? "+" : "−"}¥{it.amount.toLocaleString("ja-JP")}
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* ─── 記録 FAB ─────────────────────────────────────────────────── */}
            <motion.button
                type="button"
                onClick={() => setDrawerOpen(true)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.97 }}
                className="fixed right-4 z-40 flex h-13 items-center gap-2 px-5 text-sm font-bold text-white md:right-6"
                style={{
                    bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
                    background: C.brand,
                    borderRadius: R.badge,
                    boxShadow: `0 4px 16px rgba(240,128,48,0.40)`,
                }}
                aria-label="記録する"
            >
                <Plus size={17} strokeWidth={2.5} />
                記録する
            </motion.button>

            {/* ─── 支出記録 Drawer ───────────────────────────────────────────── */}
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-40" style={{ background: "rgba(28,20,16,0.35)" }} />
                    <Drawer.Content
                        className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] pb-8 outline-none"
                        style={{
                            background: C.card,
                            borderTop: `1px solid ${C.border}`,
                            borderRadius: "12px 12px 0 0",
                        }}
                    >
                        <div
                            className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full"
                            style={{ background: "rgba(28,20,16,0.12)" }}
                        />
                        <div
                            className="border-b px-5 pb-3.5 pt-2.5"
                            style={{ borderColor: C.border }}
                        >
                            <Drawer.Title
                                className="text-base font-extrabold"
                                style={{ color: C.text }}
                            >
                                支出を記録
                            </Drawer.Title>
                            <p className="text-xs" style={{ color: C.muted }}>
                                金額を入力してカテゴリを選択してください。
                            </p>
                        </div>
                        <div className="overflow-y-auto px-5 pt-4">
                            <form onSubmit={handleExpenseSubmit} className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold" style={{ color: C.muted }} htmlFor="d-amount">
                                        金額
                                    </label>
                                    <input
                                        id="d-amount"
                                        type="number" inputMode="numeric" min={1} required
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        className="flex h-11 w-full px-3 text-lg font-bold tabular-nums outline-none"
                                        style={{ border: `2px solid ${C.border}`, borderRadius: R.input, background: C.bg, color: C.text }}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold" style={{ color: C.muted }} htmlFor="d-cat">
                                        カテゴリ
                                    </label>
                                    <select
                                        id="d-cat"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="flex h-10 w-full px-3 text-sm font-medium outline-none"
                                        style={{ border: `2px solid ${C.border}`, borderRadius: R.input, background: C.bg, color: C.text }}
                                    >
                                        {EXPENSE_CATEGORIES.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold" style={{ color: C.muted }} htmlFor="d-note">
                                        メモ（任意）
                                    </label>
                                    <input
                                        id="d-note"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="flex h-9 w-full px-3 text-sm outline-none"
                                        style={{ border: `2px solid ${C.border}`, borderRadius: R.input, background: C.bg, color: C.text }}
                                        placeholder="店名・用途など"
                                    />
                                </div>
                                <div className="flex gap-2 pb-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex-1 py-2.5 text-sm font-semibold transition-colors hover:opacity-80"
                                        style={{
                                            border: `1px solid ${C.border}`,
                                            borderRadius: R.input,
                                            background: C.bg,
                                            color: "rgba(28,20,16,0.65)",
                                        }}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitted}
                                        className="btn-candy flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                                        style={{ background: C.brand, borderRadius: R.input }}
                                    >
                                        {submitted ? "送信中…" : <><Check size={14} />記録する</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}
