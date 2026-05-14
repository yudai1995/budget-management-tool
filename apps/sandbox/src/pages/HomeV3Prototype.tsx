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
    FileBarChart,
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
    Pencil,
    Info,
    Flame,
    AlertTriangle,
    TrendingDown,
    X,
} from "lucide-react";

// ─── モックデータ ──────────────────────────────────────────────────────────

const MOCK = {
    userId: "demo_user",
    todayExpense: 1200,
    yesterdayExpense: 3400,
    zeroStreakDays: 0,
    avgDailyExpense: 2800,
    recordedDays: 45,
    recordingStreak: 7,
    totalAssets: 850000,
    monthlyIncome: 280000,
    /** 1日予算 */
    dailyBudget: 6500,
    /** 給料日まで */
    daysUntilPayday: 18,
    monthSummary: {
        label: "2026 · 05",
        expense: 62000,
        income: 280000,
    },
    recentExpenses: [
        { id: "1", date: "2026-05-11", amount: 1200, balanceType: 0, categoryName: "食費", content: "コンビニ" },
        { id: "2", date: "2026-05-10", amount: 3400, balanceType: 0, categoryName: "日用品", content: "ドラッグストア" },
        { id: "3", date: "2026-05-09", amount: 280000, balanceType: 1, categoryName: "給与", content: "5月分給与" },
    ],
    /** アラート（未実装機能のモック） */
    alerts: [
        { id: "a1", type: "caution" as const, message: "今月の食費が先月比 +23% です" },
        { id: "a2", type: "danger" as const, message: "固定費の引き落とし予定日まで3日" },
    ],
};

// ─── 計算ユーティリティ（@budget/common の代替モック）────────────────────

function calcDaysRemaining(assets: number, netDailyExpense: number): number | null {
    if (netDailyExpense <= 0) return null;
    return Math.floor(assets / netDailyExpense);
}

function formatLifespan(daysRemaining: number | null) {
    if (daysRemaining === null) {
        return { infinite: true, months: 0, days: 0, subLabel: "収入が支出をカバーしています" };
    }
    if (daysRemaining <= 0) {
        return { infinite: false, months: 0, days: 0, subLabel: "資産の状況を確認しましょう" };
    }
    const d = Math.floor(daysRemaining);
    return {
        infinite: false,
        months: Math.floor(d / 30),
        days: d % 30,
        subLabel: `${d.toLocaleString("ja-JP")} 日後にゼロ — 今のペースを続けた場合`,
    };
}

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

// ─── ヘルパー ─────────────────────────────────────────────────────────────

function formatYen(n: number) {
    return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function formatYenSigned(n: number) {
    const sign = n >= 0 ? "+" : "−";
    return `${sign}¥${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;
}

function budgetStatusTone(ratio: number): "safe" | "caution" | "danger" {
    if (ratio >= 0.8) return "safe";
    if (ratio >= 0.2) return "caution";
    return "danger";
}

function budgetStatusLabel(tone: "safe" | "caution" | "danger") {
    return tone === "safe" ? "余裕" : tone === "caution" ? "注意" : "危機";
}

function budgetStatusMessage(tone: "safe" | "caution" | "danger") {
    if (tone === "safe") return "今日は支出をコントロールできています";
    if (tone === "caution") return "予算の大半を使いました。支出を見直しましょう";
    return "本日の予算が底をつきそうです。一度立ち止まりましょう";
}

function lifespanAccentColor(monthsApprox: number) {
    if (monthsApprox > 12) return "var(--color-income)";
    if (monthsApprox > 4) return "var(--color-brand-primary)";
    return "var(--color-danger)";
}

function categoryIcon(name: string) {
    if (name.includes("食")) return ShoppingBasket;
    if (name.includes("日用品") || name.includes("生活")) return ShoppingBag;
    if (name.includes("給") || name.includes("収")) return CircleDollarSign;
    return Pencil;
}

function categoryAccent(name: string) {
    if (name.includes("食")) return { bg: "color-mix(in srgb, var(--color-expense) 12%, transparent)", fg: "var(--color-expense)" };
    if (name.includes("日用品") || name.includes("生活")) return { bg: "color-mix(in srgb, #a855f7 12%, transparent)", fg: "#a855f7" };
    if (name.includes("給") || name.includes("収")) return { bg: "color-mix(in srgb, var(--color-income) 12%, transparent)", fg: "var(--color-income)" };
    return { bg: "var(--color-surface-subtle)", fg: "var(--color-text-muted)" };
}

// ─── アニメーション付き数値 ───────────────────────────────────────────────

function useAnimatedNumber(value: number, format: (n: number) => string): string {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);
    useEffect(() => {
        const from = prev.current;
        const controls = animate(from, value, {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(v),
        });
        prev.current = value;
        return () => controls.stop();
    }, [value]);
    return format(display);
}

// ─── セットアップモーダル（インライン）───────────────────────────────────

function SetupModal({
    defaultAssets,
    defaultIncome,
    onSave,
    onClose,
}: {
    defaultAssets?: number;
    defaultIncome: number;
    onSave: (assets: number, income: number) => void;
    onClose?: () => void;
}) {
    const [assets, setAssets] = useState(String(defaultAssets ?? ""));
    const [income, setIncome] = useState(String(defaultIncome || ""));

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const a = Number(assets);
        const i = Number(income);
        if (!a || !i) return;
        onSave(a, i);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(28,20,16,0.55)" }}>
            <div className="relative mx-4 w-full max-w-sm rounded-2xl p-6" style={{ background: "#fffdf5" }}>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#1c1410]/50 hover:bg-[#f5f1eb]"
                        aria-label="閉じる"
                    >
                        <X size={16} />
                    </button>
                )}
                <h2 className="mb-1 text-lg font-extrabold text-[#1c1410]">初期設定</h2>
                <p className="mb-5 text-sm text-[#1c1410]/55">現在の資産と月収を入力してください</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-[#1c1410]/55" htmlFor="setup-assets">
                            現在の総資産（円）
                        </label>
                        <input
                            id="setup-assets"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            required
                            value={assets}
                            onChange={(e) => setAssets(e.target.value)}
                            className="flex h-11 w-full rounded-xl border-2 border-[#1c1410]/15 bg-white px-3 text-base font-bold tabular-nums outline-none focus:border-[#f18840]"
                            placeholder="例: 500000"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-[#1c1410]/55" htmlFor="setup-income">
                            月収（手取り、円）
                        </label>
                        <input
                            id="setup-income"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            required
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="flex h-11 w-full rounded-xl border-2 border-[#1c1410]/15 bg-white px-3 text-base font-bold tabular-nums outline-none focus:border-[#f18840]"
                            placeholder="例: 280000"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--color-brand-primary)" }}
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
    // モック状態（実装時は API / Server Actions に置き換える）
    const [totalAssets, setTotalAssets] = useState<number | null>(MOCK.totalAssets);
    const [monthlyIncome, setMonthlyIncome] = useState(MOCK.monthlyIncome);
    const [showSetup, setShowSetup] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [amountStr, setAmountStr] = useState("");
    const [categoryId, setCategoryId] = useState(MOCK.recentExpenses[0]?.id ?? "1");
    const [content, setContent] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [alerts, setAlerts] = useState(MOCK.alerts);

    const netDailyExpense = Math.max(0, MOCK.avgDailyExpense - monthlyIncome / 30);
    const daysRemaining = totalAssets !== null ? calcDaysRemaining(totalAssets, netDailyExpense) : null;

    const remaining = Math.max(0, MOCK.dailyBudget - MOCK.todayExpense);
    const animatedRemaining = useAnimatedNumber(remaining, formatYen);
    const ratio = MOCK.dailyBudget > 0 ? remaining / MOCK.dailyBudget : 1;
    const tone = budgetStatusTone(ratio);
    const fillPct = Math.round(Math.max(0, Math.min(100, ratio * 100)));

    const lm = useMemo(() => formatLifespan(daysRemaining), [daysRemaining]);
    const monthsApprox = daysRemaining !== null ? daysRemaining / 30 : 999;
    const lifespanAccent = lifespanAccentColor(monthsApprox);

    const netMonth = MOCK.monthSummary.income - MOCK.monthSummary.expense;
    const avatarLetter = MOCK.userId.charAt(0).toUpperCase();

    // ドロワー送信モック
    function handleExpenseSubmit(e: React.FormEvent) {
        e.preventDefault();
        const amount = Number(amountStr);
        if (!amount) return;
        console.log("[モック] 支出記録:", { amount, categoryId, content });
        setSubmitted(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setAmountStr("");
            setContent("");
            setSubmitted(false);
        }, 600);
    }

    return (
        <div
            className="min-h-screen pb-28"
            style={{ background: "var(--color-surface-base)", color: "var(--color-text-primary)" }}
        >
            {showSetup && (
                <SetupModal
                    defaultAssets={totalAssets ?? undefined}
                    defaultIncome={monthlyIncome}
                    onSave={(a, i) => {
                        setTotalAssets(a);
                        setMonthlyIncome(i);
                        setShowSetup(false);
                    }}
                    onClose={totalAssets !== null ? () => setShowSetup(false) : undefined}
                />
            )}

            {/* ─── ヘッダー ─────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-20 border-b backdrop-blur-md"
                style={{
                    background: "color-mix(in srgb, var(--color-surface-base) 88%, transparent)",
                    borderColor: "var(--border-default)",
                }}
            >
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 md:h-16 md:px-6">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: "var(--color-text-primary)", color: "var(--color-brand-secondary)" }}
                        >
                            <Pencil className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0 leading-tight">
                            <div className="truncate text-[15px] font-bold tracking-tight">家計かんり</div>
                            <div className="truncate text-[10px] font-mono uppercase tracking-wider text-[#1c1410]/45">Dashboard</div>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-0.5 md:flex">
                        {[
                            { to: "/home-v3", label: "ダッシュボード", icon: Home, active: true },
                            { to: "#", label: "カレンダー", icon: Calendar, active: false },
                            { to: "#", label: "レポート", icon: FileBarChart, active: false },
                            { to: "#", label: "設定", icon: Settings, active: false },
                        ].map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                                    item.active
                                        ? "bg-[#f5f1eb] text-[#1c1410]"
                                        : "text-[#1c1410]/55 hover:bg-[#f5f1eb]/60 hover:text-[#1c1410]"
                                }`}
                            >
                                <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#1c1410]/55 transition-colors hover:bg-[#f5f1eb]"
                            aria-label="通知"
                        >
                            <Bell className="h-4 w-4" />
                            {alerts.length > 0 && (
                                <span
                                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                                    style={{ background: "var(--color-brand-primary)" }}
                                />
                            )}
                        </button>
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-sm"
                            style={{
                                background: `linear-gradient(to bottom right, var(--color-brand-secondary), var(--color-brand-primary))`,
                            }}
                        >
                            {avatarLetter}
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative mx-auto max-w-6xl space-y-4 px-4 py-5 md:space-y-5 md:px-6 md:py-6">

                {/* ─── アラートバナー（モック機能） ─────────────────────── */}
                {alerts.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 rounded-xl border px-4 py-3"
                                style={{
                                    borderColor: alert.type === "danger"
                                        ? "color-mix(in srgb, var(--color-danger) 30%, transparent)"
                                        : "color-mix(in srgb, var(--color-caution) 30%, transparent)",
                                    background: alert.type === "danger"
                                        ? "color-mix(in srgb, var(--color-danger) 7%, white)"
                                        : "color-mix(in srgb, var(--color-caution) 7%, white)",
                                }}
                            >
                                {alert.type === "danger"
                                    ? <TrendingDown size={15} style={{ color: "var(--color-danger)", flexShrink: 0, marginTop: 1 }} />
                                    : <AlertTriangle size={15} style={{ color: "var(--color-caution)", flexShrink: 0, marginTop: 1 }} />
                                }
                                <span className="flex-1 text-[12.5px] font-medium text-[#1c1410]/80">{alert.message}</span>
                                <button
                                    type="button"
                                    onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                                    className="shrink-0 text-[#1c1410]/30 hover:text-[#1c1410]/60"
                                    aria-label="閉じる"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
                    {/* ─── 今日使えるお金 ──────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div
                            className="relative overflow-hidden rounded-2xl border p-6 md:p-7"
                            style={{
                                boxShadow: "var(--shadow-card)",
                                background: tone === "safe"
                                    ? "color-mix(in srgb, var(--color-income) 8%, white)"
                                    : tone === "caution"
                                        ? "color-mix(in srgb, var(--color-caution) 10%, white)"
                                        : "color-mix(in srgb, var(--color-danger) 8%, white)",
                                borderColor: tone === "safe"
                                    ? "color-mix(in srgb, var(--color-income) 25%, transparent)"
                                    : tone === "caution"
                                        ? "color-mix(in srgb, var(--color-caution) 35%, transparent)"
                                        : "color-mix(in srgb, var(--color-danger) 30%, transparent)",
                            }}
                        >
                            <div
                                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20"
                                style={{
                                    background: tone === "safe"
                                        ? "radial-gradient(circle, var(--color-income) 0%, transparent 70%)"
                                        : tone === "caution"
                                            ? "radial-gradient(circle, var(--color-caution) 0%, transparent 70%)"
                                            : "radial-gradient(circle, var(--color-danger) 0%, transparent 70%)",
                                }}
                            />
                            <div className="relative">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div>
                                        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c1410]/40">Today</div>
                                        <div className="text-sm font-semibold text-[#1c1410]/70">今日使えるお金</div>
                                    </div>
                                    <span
                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                        style={{
                                            background: tone === "safe"
                                                ? "color-mix(in srgb, var(--color-income) 14%, white)"
                                                : tone === "caution"
                                                    ? "color-mix(in srgb, var(--color-caution) 14%, white)"
                                                    : "color-mix(in srgb, var(--color-danger) 14%, white)",
                                            color: tone === "safe" ? "var(--color-income)" : tone === "caution" ? "var(--color-caution)" : "var(--color-danger)",
                                        }}
                                    >
                                        <span
                                            className="h-1.5 w-1.5 rounded-full"
                                            style={{
                                                background: tone === "safe" ? "var(--color-income)" : tone === "caution" ? "var(--color-caution)" : "var(--color-danger)",
                                            }}
                                        />
                                        {budgetStatusLabel(tone)}
                                    </span>
                                </div>

                                <div className="mb-4 flex items-baseline gap-3">
                                    <span
                                        className="font-mono text-4xl font-extrabold tracking-tight tabular-nums md:text-5xl"
                                        style={{
                                            color: tone === "safe" ? "var(--color-income)" : tone === "caution" ? "var(--color-caution)" : "var(--color-danger)",
                                        }}
                                    >
                                        {animatedRemaining}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <div className="mb-1.5 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-[#1c1410]/45">
                                        <span>残り</span>
                                        <span className="tabular-nums">{fillPct}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1410]/10">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{
                                                background: tone === "safe" ? "var(--color-income)" : tone === "caution" ? "var(--color-caution)" : "var(--color-danger)",
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${fillPct}%` }}
                                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] font-medium text-[#1c1410]/65">
                                    <span>1日予算 <span className="font-semibold tabular-nums text-[#1c1410]">{formatYen(MOCK.dailyBudget)}</span></span>
                                    <span className="hidden h-3 w-px bg-[#1c1410]/10 sm:inline" />
                                    <span>本日支出 <span className="font-semibold tabular-nums text-[#1c1410]">{formatYen(MOCK.todayExpense)}</span></span>
                                    <span className="hidden h-3 w-px bg-[#1c1410]/10 sm:inline" />
                                    <span>給料日まで <span className="font-semibold tabular-nums text-[#1c1410]">あと {MOCK.daysUntilPayday} 日</span></span>
                                </div>

                                <div
                                    className="mt-4 flex items-center gap-2 text-[12.5px] font-medium"
                                    style={{
                                        color: tone === "safe" ? "var(--color-income)" : tone === "caution" ? "var(--color-caution)" : "var(--color-danger)",
                                    }}
                                >
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    <span>{budgetStatusMessage(tone)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── 月の収支 ─────────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div
                            className="rounded-2xl border p-5"
                            style={{ boxShadow: "var(--shadow-card)", background: "var(--color-surface-elevated)", borderColor: "var(--border-default)" }}
                        >
                            <div className="mb-3 flex items-center justify-between px-0.5">
                                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c1410]/40">月の収支</span>
                                <span className="font-mono text-[11px] text-[#1c1410]/45">{MOCK.monthSummary.label}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="rounded-xl p-3.5" style={{ background: "color-mix(in srgb, var(--color-expense) 10%, white)" }}>
                                    <div className="mb-1.5 flex items-center gap-1.5">
                                        <Receipt className="h-3 w-3 shrink-0" style={{ color: "var(--color-expense)" }} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--color-expense)" }}>支出</span>
                                    </div>
                                    <div className="font-mono text-[17px] font-extrabold tabular-nums tracking-tight" style={{ color: "var(--color-expense)" }}>
                                        {formatYen(MOCK.monthSummary.expense)}
                                    </div>
                                </div>
                                <div className="rounded-xl p-3.5" style={{ background: "color-mix(in srgb, var(--color-income) 10%, white)" }}>
                                    <div className="mb-1.5 flex items-center gap-1.5">
                                        <Banknote className="h-3 w-3 shrink-0" style={{ color: "var(--color-income)" }} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--color-income)" }}>収入</span>
                                    </div>
                                    <div className="font-mono text-[17px] font-extrabold tabular-nums tracking-tight" style={{ color: "var(--color-income)" }}>
                                        {formatYen(MOCK.monthSummary.income)}
                                    </div>
                                </div>
                                <div className="rounded-xl p-3.5" style={{ background: "var(--color-surface-subtle)" }}>
                                    <div className="mb-1.5 flex items-center gap-1.5">
                                        <Wallet className="h-3 w-3 shrink-0 text-[#1c1410]/45" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#1c1410]/45">残り</span>
                                    </div>
                                    <div
                                        className="font-mono text-[17px] font-extrabold tabular-nums tracking-tight"
                                        style={{ color: netMonth >= 0 ? "var(--color-income)" : "var(--color-danger)" }}
                                    >
                                        {formatYenSigned(netMonth)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── 家計の寿命 ───────────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        {totalAssets === null ? (
                            <div
                                className="rounded-2xl border-2 border-dashed p-6 text-center"
                                style={{ boxShadow: "var(--shadow-card)", borderColor: "var(--border-default)", background: "var(--color-surface-subtle)" }}
                            >
                                <p className="mb-3 text-sm font-medium text-[#1c1410]/50">設定を完了すると「家計の寿命」が表示されます</p>
                                <button
                                    type="button"
                                    onClick={() => setShowSetup(true)}
                                    className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                                    style={{ background: "var(--color-brand-primary)" }}
                                >
                                    設定する
                                </button>
                            </div>
                        ) : (
                            <div
                                className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
                                style={{ boxShadow: "var(--shadow-card)", background: "var(--color-surface-elevated)", borderColor: "var(--border-default)" }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                                    style={{ background: `radial-gradient(ellipse at center top, ${lifespanAccent} 0%, transparent 60%)` }}
                                />
                                <div className="relative">
                                    <div className="mb-3 flex items-center justify-between px-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c1410]/40">家計の寿命</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[11px] text-[#1c1410]/40">LIFESPAN</span>
                                            <button
                                                type="button"
                                                onClick={() => setShowSetup(true)}
                                                className="rounded-lg px-2 py-0.5 text-[10px] font-bold transition-colors hover:bg-[#f5f1eb]"
                                                style={{ color: "var(--color-brand-primary)" }}
                                            >
                                                設定変更
                                            </button>
                                        </div>
                                    </div>

                                    <div className="py-4 text-center md:py-6">
                                        {lm.infinite ? (
                                            <div>
                                                <div className="font-mono text-5xl font-extrabold tabular-nums tracking-tight md:text-6xl" style={{ color: "var(--color-income)" }}>∞</div>
                                                <div className="mt-2 text-[12.5px] font-medium text-[#1c1410]/50">{lm.subLabel}</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-wrap items-baseline justify-center gap-2" style={{ color: lifespanAccent }}>
                                                    <span className="text-base font-semibold text-[#1c1410]/55">あと</span>
                                                    <motion.span
                                                        key={`m-${lm.months}`}
                                                        className="font-mono text-5xl font-extrabold tabular-nums tracking-tight md:text-6xl"
                                                        initial={{ opacity: 0.45, y: -6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                                    >
                                                        {lm.months}
                                                    </motion.span>
                                                    <span className="text-2xl font-bold md:text-3xl">ヶ月</span>
                                                    <motion.span
                                                        key={`d-${lm.days}`}
                                                        className="font-mono text-4xl font-extrabold tabular-nums tracking-tight md:text-5xl"
                                                        initial={{ opacity: 0.45, y: -6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                                    >
                                                        {lm.days}
                                                    </motion.span>
                                                    <span className="text-2xl font-bold md:text-3xl">日</span>
                                                </div>
                                                <div className="mt-2 text-[12.5px] font-medium text-[#1c1410]/50">{lm.subLabel}</div>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                                        {[
                                            { label: "残存資産", value: formatYen(totalAssets) },
                                            { label: "1日あたり", value: formatYen(MOCK.avgDailyExpense) },
                                            { label: "今日", value: formatYen(MOCK.todayExpense), highlight: MOCK.todayExpense === 0 ? "income" : "expense" },
                                            { label: "昨日", value: formatYen(MOCK.yesterdayExpense) },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-xl px-3.5 py-3" style={{ background: "var(--color-surface-subtle)" }}>
                                                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#1c1410]/40">{item.label}</div>
                                                <div
                                                    className="font-mono text-[17px] font-extrabold tabular-nums"
                                                    style={{
                                                        color: item.highlight === "income"
                                                            ? "var(--color-income)"
                                                            : item.highlight === "expense"
                                                                ? "var(--color-expense)"
                                                                : "#1c1410",
                                                    }}
                                                >
                                                    {item.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 予測精度 */}
                                    <div className="mt-5 border-t border-[#1c1410]/10 pt-4">
                                        <div className="mb-2 flex justify-between text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#1c1410]/40">
                                            <span>予測の精度</span>
                                            <span className="tabular-nums">{MOCK.recordedDays}日分の実績</span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded-full bg-[#f5f1eb]">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: "var(--color-brand-primary)" }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (MOCK.recordedDays / 90) * 100)}%` }}
                                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                    </div>

                                    {/* 連続記録ストリーク */}
                                    {MOCK.recordingStreak >= 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2"
                                            style={{ background: "color-mix(in srgb, var(--color-brand-primary) 10%, white)" }}
                                        >
                                            <Flame size={16} style={{ color: "var(--color-brand-primary)" }} />
                                            <span className="text-[12.5px] font-semibold" style={{ color: "var(--color-brand-primary)" }}>
                                                {MOCK.recordingStreak}日連続記録中
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── 最近の記録 ───────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div
                            className="rounded-2xl border p-5"
                            style={{ boxShadow: "var(--shadow-card)", background: "var(--color-surface-elevated)", borderColor: "var(--border-default)" }}
                        >
                            <div className="mb-3 flex items-center justify-between px-0.5">
                                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c1410]/40">最近の記録</span>
                                <span className="text-[11px] font-bold" style={{ color: "var(--color-brand-primary)" }}>すべて見る ›</span>
                            </div>
                            <ul>
                                {MOCK.recentExpenses.map((it, i) => {
                                    const catName = it.categoryName;
                                    const Icon = categoryIcon(catName);
                                    const acc = categoryAccent(catName);
                                    const isIncome = it.balanceType === 1;
                                    const title = it.content?.trim() || catName;
                                    return (
                                        <motion.li
                                            key={it.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-3 border-b border-[#1c1410]/[0.08] py-3 last:border-0"
                                        >
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                                style={{ background: acc.bg, color: acc.fg }}
                                            >
                                                <Icon className="h-4 w-4" aria-hidden />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13.5px] font-semibold text-[#1c1410]">{title}</div>
                                                <div className="text-[11px] font-medium tabular-nums text-[#1c1410]/45">{it.date} · {catName}</div>
                                            </div>
                                            <div
                                                className="shrink-0 font-mono text-[14.5px] font-extrabold tabular-nums tracking-tight"
                                                style={{ color: isIncome ? "var(--color-income)" : "var(--color-text-primary)" }}
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

            {/* ─── 記録 FAB ──────────────────────────────────────────────── */}
            <motion.button
                type="button"
                onClick={() => setDrawerOpen(true)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.97 }}
                className="fixed right-4 z-40 flex h-14 items-center gap-2.5 rounded-full px-5 text-[14px] font-bold text-white shadow-lg md:right-6"
                style={{
                    bottom: "calc(4rem + env(safe-area-inset-bottom, 0px) + 12px)",
                    background: "var(--color-brand-primary)",
                    boxShadow: "0 10px 24px color-mix(in srgb, var(--color-brand-primary) 35%, transparent)",
                }}
                aria-label="記録する"
            >
                <Plus className="h-5 w-5" strokeWidth={2.5} />
                記録する
            </motion.button>

            {/* ─── 支出記録 Drawer ───────────────────────────────────────── */}
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                    <Drawer.Content
                        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] rounded-t-2xl border-t-2 border-[#1c1410]/10 bg-[#fffdf5] pb-6 outline-none"
                    >
                        <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-[#1c1410]/15" />
                        <div className="border-b border-[#1c1410]/10 px-4 pb-4 pt-2">
                            <Drawer.Title className="text-lg font-extrabold text-[#1c1410]">支出を記録</Drawer.Title>
                            <p className="text-sm text-[#1c1410]/55">金額を入力してカテゴリを選択してください。</p>
                        </div>
                        <div className="space-y-4 overflow-y-auto px-4 pt-4">
                            <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wide text-[#1c1410]/55" htmlFor="v3-amount">金額</label>
                                    <input
                                        id="v3-amount"
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        required
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border-2 border-[#1c1410]/15 bg-white px-3 text-lg font-bold tabular-nums outline-none focus:border-[#f18840]"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wide text-[#1c1410]/55" htmlFor="v3-cat">カテゴリ</label>
                                    <select
                                        id="v3-cat"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="flex h-11 w-full rounded-xl border-2 border-[#1c1410]/15 bg-white px-3 text-sm font-medium outline-none focus:border-[#f18840]"
                                    >
                                        {EXPENSE_CATEGORIES.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wide text-[#1c1410]/55" htmlFor="v3-content">メモ（任意）</label>
                                    <input
                                        id="v3-content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="flex h-10 w-full rounded-xl border-2 border-[#1c1410]/15 bg-white px-3 text-sm outline-none focus:border-[#f18840]"
                                        placeholder="店名・用途など"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex-1 rounded-xl border-2 border-[#1c1410]/15 py-3 text-sm font-bold text-[#1c1410]/70 transition-colors hover:bg-[#f5f1eb]"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitted}
                                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#1c1410] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                        style={{ background: "var(--color-brand-primary)" }}
                                    >
                                        {submitted ? "送信中…" : <><Check className="h-4 w-4" />記録する</>}
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
