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
    Info,
    Flame,
    AlertTriangle,
    TrendingDown,
    X,
} from "lucide-react";

// ─── テーマ定数（変更ポイント）────────────────────────────────────────────

const T = {
    /** ページ全体の背景 */
    pageBg: "#f0ebe3",
    /** カード背景（白） */
    cardBg: "#ffffff",
    /** TODAY'S BUDGET カード背景（常に暖色ベージュ） */
    budgetCardBg: "#e8ddd3",
    /** メインテキスト */
    text: "#1c1410",
    /** ミュートテキスト */
    muted: "rgba(28,20,16,0.45)",
    /** ブランドオレンジ */
    brand: "#f18840",
    /** 収入グリーン */
    income: "#35b5a2",
    /** 支出オレンジ（brand と同色） */
    expense: "#f18840",
    /** 危機レッド */
    danger: "#e84040",
    /** 警戒アンバー */
    caution: "#f5a623",
    /** ボーダー */
    border: "rgba(28,20,16,0.10)",
    /** カードシャドウ */
    shadow: "0 1px 4px rgba(28,20,16,0.07)",
};

// ─── モックデータ（ここを変えるとプレビューが変わる）────────────────────

const MOCK = {
    userId: "Y",
    todayExpense: 0,
    yesterdayExpense: 0,
    zeroStreakDays: 2,
    avgDailyExpense: 4559,
    recordedDays: 6,
    recordingStreak: 6,
    totalAssets: 999853,
    monthlyIncome: 252600,
    dailyBudget: 76923,
    daysUntilPayday: 13,
    monthSummary: {
        label: "2026 / 05",
        expense: 68700,
        income: 252600,
    },
    recentExpenses: [
        { id: "1", date: "2026-05-12", amount: 1280, balanceType: 0, categoryName: "食費", content: "スーパー" },
        { id: "2", date: "2026-05-11", amount: 20000, balanceType: 0, categoryName: "日用品", content: "生活用品" },
        { id: "3", date: "2026-05-10", amount: 50000, balanceType: 1, categoryName: "給料", content: "5月給与" },
    ],
    alerts: [
        { id: "a1", type: "caution" as const, message: "今月の食費が先月比 +23% です" },
        { id: "a2", type: "danger" as const, message: "固定費の引き落とし予定日まで3日" },
    ],
};

// ─── 計算ユーティリティ ───────────────────────────────────────────────────

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

function lifespanAccentColor(monthsApprox: number) {
    if (monthsApprox > 12) return T.income;
    if (monthsApprox > 4) return T.brand;
    return T.danger;
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

type Tone = "safe" | "caution" | "danger";

function budgetTone(ratio: number): Tone {
    if (ratio >= 0.8) return "safe";
    if (ratio >= 0.2) return "caution";
    return "danger";
}

function toneLabel(tone: Tone) {
    return tone === "safe" ? "余裕" : tone === "caution" ? "注意" : "危機";
}

function toneMessage(tone: Tone) {
    if (tone === "safe") return "今日は支出をコントロールできています";
    if (tone === "caution") return "予算の大半を使いました。支出を見直しましょう";
    return "本日の予算が底をつきそうです。一度立ち止まりましょう";
}

/** トーンに応じた強調色（バッジドット・インフォテキストのみ） */
function toneAccent(tone: Tone) {
    if (tone === "safe") return T.income;
    if (tone === "caution") return T.caution;
    return T.danger;
}

function categoryIcon(name: string) {
    if (name.includes("食")) return ShoppingBasket;
    if (name.includes("日用品") || name.includes("生活")) return ShoppingBag;
    if (name.includes("給") || name.includes("収")) return CircleDollarSign;
    return ShoppingBasket;
}

function categoryAccent(name: string) {
    if (name.includes("食"))
        return { bg: `color-mix(in srgb, ${T.expense} 14%, white)`, fg: T.expense };
    if (name.includes("日用品") || name.includes("生活"))
        return { bg: "color-mix(in srgb, #a855f7 14%, white)", fg: "#a855f7" };
    if (name.includes("給") || name.includes("収"))
        return { bg: `color-mix(in srgb, ${T.income} 14%, white)`, fg: T.income };
    return { bg: "rgba(28,20,16,0.07)", fg: T.muted };
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

// ─── SetupModal ───────────────────────────────────────────────────────────

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(28,20,16,0.50)" }}>
            <div className="relative mx-4 w-full max-w-sm rounded-2xl p-6" style={{ background: T.cardBg }}>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                        style={{ color: T.muted }}
                        aria-label="閉じる"
                    >
                        <X size={16} />
                    </button>
                )}
                <h2 className="mb-1 text-lg font-extrabold" style={{ color: T.text }}>初期設定</h2>
                <p className="mb-5 text-sm" style={{ color: T.muted }}>現在の資産と月収を入力してください</p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const a = Number(assets);
                        const i = Number(income);
                        if (!a || !i) return;
                        onSave(a, i);
                    }}
                    className="space-y-4"
                >
                    {[
                        { id: "setup-assets", label: "現在の総資産（円）", val: assets, set: setAssets, ph: "例: 500000" },
                        { id: "setup-income", label: "月収（手取り、円）", val: income, set: setIncome, ph: "例: 280000" },
                    ].map((f) => (
                        <div key={f.id} className="space-y-1.5">
                            <label
                                className="text-xs font-bold uppercase tracking-wide"
                                style={{ color: T.muted }}
                                htmlFor={f.id}
                            >
                                {f.label}
                            </label>
                            <input
                                id={f.id}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                required
                                value={f.val}
                                onChange={(e) => f.set(e.target.value)}
                                className="flex h-11 w-full rounded-xl px-3 text-base font-bold tabular-nums outline-none"
                                style={{ border: `2px solid ${T.border}`, background: T.pageBg }}
                                placeholder={f.ph}
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: T.brand }}
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
    const [showSetup, setShowSetup] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [amountStr, setAmountStr] = useState("");
    const [categoryId, setCategoryId] = useState("1");
    const [noteText, setNoteText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [alerts, setAlerts] = useState(MOCK.alerts);

    const netDailyExpense = Math.max(0, MOCK.avgDailyExpense - monthlyIncome / 30);
    const daysRemaining = totalAssets !== null ? calcDaysRemaining(totalAssets, netDailyExpense) : null;

    const remaining = Math.max(0, MOCK.dailyBudget - MOCK.todayExpense);
    const animatedRemaining = useAnimatedNumber(remaining, formatYen);
    const ratio = MOCK.dailyBudget > 0 ? remaining / MOCK.dailyBudget : 1;
    const tone = budgetTone(ratio);
    const fillPct = Math.round(Math.max(0, Math.min(100, ratio * 100)));
    const accent = toneAccent(tone);

    const lm = useMemo(() => formatLifespan(daysRemaining), [daysRemaining]);
    const monthsApprox = daysRemaining !== null ? daysRemaining / 30 : 999;
    const lifespanAccent = lifespanAccentColor(monthsApprox);

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
        <div className="min-h-screen pb-28" style={{ background: T.pageBg, color: T.text }}>
            {showSetup && (
                <SetupModal
                    defaultAssets={totalAssets ?? undefined}
                    defaultIncome={monthlyIncome}
                    onSave={(a, i) => { setTotalAssets(a); setMonthlyIncome(i); setShowSetup(false); }}
                    onClose={totalAssets !== null ? () => setShowSetup(false) : undefined}
                />
            )}

            {/* ─── ヘッダー ────────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-20 border-b"
                style={{
                    background: `color-mix(in srgb, ${T.pageBg} 92%, transparent)`,
                    backdropFilter: "blur(12px)",
                    borderColor: T.border,
                }}
            >
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5 md:h-16 md:px-8">
                    {/* ロゴ */}
                    <div className="flex shrink-0 items-center gap-2.5">
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-black text-white"
                            style={{ background: T.text }}
                        >
                            L
                        </div>
                        <div className="leading-tight">
                            <div className="text-[15px] font-bold tracking-tight" style={{ color: T.text }}>
                                Lifespan
                            </div>
                            <div
                                className="text-[9px] font-bold uppercase tracking-[0.18em]"
                                style={{ color: T.muted }}
                            >
                                Financial Manager
                            </div>
                        </div>
                    </div>

                    {/* センターナビ */}
                    <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
                        {[
                            { to: "/home-v3", label: "ダッシュボード", icon: Home, active: true },
                            { to: "#", label: "カレンダー", icon: Calendar, active: false },
                            { to: "#", label: "レポート", icon: FileBarChart, active: false },
                            { to: "#", label: "設定", icon: Settings, active: false },
                        ].map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors"
                                style={
                                    item.active
                                        ? {
                                            background: T.cardBg,
                                            color: T.text,
                                            boxShadow: "0 1px 3px rgba(28,20,16,0.12)",
                                        }
                                        : { color: T.muted }
                                }
                            >
                                <item.icon size={14} aria-hidden />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* 右側アクション */}
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                            style={{ color: T.muted }}
                            aria-label="通知"
                        >
                            <Bell size={18} />
                            {alerts.length > 0 && (
                                <span
                                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2"
                                    style={{ background: T.brand, ringColor: T.pageBg }}
                                />
                            )}
                        </button>
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
                            style={{ background: T.brand }}
                        >
                            {MOCK.userId}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-4 px-4 py-5 md:px-8 md:py-6">

                {/* ─── アラートバナー ──────────────────────────────────────── */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                                style={{
                                    borderColor: `color-mix(in srgb, ${alert.type === "danger" ? T.danger : T.caution} 28%, transparent)`,
                                    background: `color-mix(in srgb, ${alert.type === "danger" ? T.danger : T.caution} 6%, white)`,
                                }}
                            >
                                {alert.type === "danger"
                                    ? <TrendingDown size={14} style={{ color: T.danger, flexShrink: 0 }} />
                                    : <AlertTriangle size={14} style={{ color: T.caution, flexShrink: 0 }} />
                                }
                                <span className="flex-1 text-[12.5px] font-medium" style={{ color: T.text + "cc" }}>
                                    {alert.message}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                                    className="shrink-0 transition-opacity hover:opacity-60"
                                    style={{ color: T.muted }}
                                    aria-label="閉じる"
                                >
                                    <X size={13} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ─── メイングリッド ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] lg:items-start">

                    {/* 左カラム */}
                    <div className="space-y-4">

                        {/* TODAY'S BUDGET */}
                        <div
                            className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                            style={{ background: T.budgetCardBg, boxShadow: T.shadow }}
                        >
                            <div className="mb-5 flex items-start justify-between gap-2">
                                <div>
                                    <div
                                        className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em]"
                                        style={{ color: T.muted }}
                                    >
                                        Today's Budget
                                    </div>
                                    <div className="text-[14px] font-semibold" style={{ color: `${T.text}bb` }}>
                                        今日使えるお金
                                    </div>
                                </div>
                                {/* ステータスバッジ — 常にニュートラルグレー、ドットのみ色付き */}
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                                    style={{
                                        background: "rgba(28,20,16,0.09)",
                                        color: `${T.text}99`,
                                    }}
                                >
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ background: accent }}
                                    />
                                    {toneLabel(tone)}
                                </span>
                            </div>

                            {/* ヒーローナンバー */}
                            <div
                                className="mb-5 font-mono text-5xl font-extrabold tracking-tight tabular-nums md:text-6xl"
                                style={{ color: T.text }}
                            >
                                {animatedRemaining}
                            </div>

                            {/* プログレスバー */}
                            <div className="mb-4">
                                <div
                                    className="mb-1.5 flex justify-between text-[11px] font-medium"
                                    style={{ color: T.muted }}
                                >
                                    <span>残り</span>
                                    <span className="tabular-nums">{fillPct}%</span>
                                </div>
                                <div
                                    className="h-1.5 overflow-hidden rounded-full"
                                    style={{ background: "rgba(28,20,16,0.12)" }}
                                >
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: T.text }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fillPct}%` }}
                                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                </div>
                            </div>

                            {/* メタ行 */}
                            <div
                                className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium"
                                style={{ color: `${T.text}99` }}
                            >
                                <span>
                                    1日予算{" "}
                                    <span className="font-semibold tabular-nums" style={{ color: T.text }}>
                                        {formatYen(MOCK.dailyBudget)}
                                    </span>
                                </span>
                                <span className="h-3 w-px" style={{ background: "rgba(28,20,16,0.15)" }} />
                                <span>
                                    本日支出{" "}
                                    <span className="font-semibold tabular-nums" style={{ color: T.text }}>
                                        {formatYen(MOCK.todayExpense)}
                                    </span>
                                </span>
                                <span className="h-3 w-px" style={{ background: "rgba(28,20,16,0.15)" }} />
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ background: T.brand }}
                                    />
                                    給料日まで{" "}
                                    <span className="font-bold tabular-nums" style={{ color: T.text }}>
                                        あと {MOCK.daysUntilPayday} 日
                                    </span>
                                </span>
                            </div>

                            {/* ステータスメッセージ */}
                            <div
                                className="flex items-center gap-2 text-[12px] font-medium"
                                style={{ color: T.muted }}
                            >
                                <Info size={13} className="shrink-0" />
                                <span>{toneMessage(tone)}</span>
                            </div>
                        </div>

                        {/* 家計の寿命 */}
                        {totalAssets === null ? (
                            <div
                                className="rounded-2xl border-2 border-dashed p-6 text-center"
                                style={{ borderColor: T.border, background: T.cardBg }}
                            >
                                <p className="mb-3 text-sm font-medium" style={{ color: T.muted }}>
                                    設定を完了すると「家計の寿命」が表示されます
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowSetup(true)}
                                    className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                                    style={{ background: T.brand }}
                                >
                                    設定する
                                </button>
                            </div>
                        ) : (
                            <div
                                className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                                style={{ background: T.cardBg, boxShadow: T.shadow }}
                            >
                                {/* ヘッダー行 */}
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: T.muted }}>
                                        家計の寿命
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px]" style={{ color: T.muted }}>LIFESPAN</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowSetup(true)}
                                            className="rounded-lg px-2 py-0.5 text-[10px] font-bold transition-colors hover:bg-black/5"
                                            style={{ color: T.brand }}
                                        >
                                            設定変更
                                        </button>
                                    </div>
                                </div>

                                {/* 寿命メイン表示 */}
                                <div className="py-6 text-center md:py-8">
                                    {lm.infinite ? (
                                        <>
                                            <div className="font-mono text-6xl font-extrabold" style={{ color: T.income }}>∞</div>
                                            <div className="mt-2 text-[12.5px] font-medium" style={{ color: T.muted }}>{lm.subLabel}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-baseline justify-center gap-1.5">
                                                <span className="text-lg font-semibold" style={{ color: `${T.text}88` }}>あと</span>
                                                <motion.span
                                                    key={`m-${lm.months}`}
                                                    className="font-mono text-6xl font-black tabular-nums tracking-tight"
                                                    style={{ color: lifespanAccent }}
                                                    initial={{ opacity: 0.5, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {lm.months}
                                                </motion.span>
                                                <span className="text-2xl font-bold" style={{ color: lifespanAccent }}>ヶ月</span>
                                                <motion.span
                                                    key={`d-${lm.days}`}
                                                    className="font-mono text-5xl font-black tabular-nums tracking-tight"
                                                    style={{ color: lifespanAccent }}
                                                    initial={{ opacity: 0.5, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {lm.days}
                                                </motion.span>
                                                <span className="text-2xl font-bold" style={{ color: lifespanAccent }}>日</span>
                                            </div>
                                            <div className="mt-2 text-[12.5px] font-medium" style={{ color: T.muted }}>
                                                {lm.subLabel}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* スタットグリッド */}
                                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                                    <div className="rounded-xl p-3.5" style={{ background: T.pageBg }}>
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: T.muted }}>残存資産</div>
                                        <div className="font-mono text-[17px] font-extrabold tabular-nums" style={{ color: T.text }}>
                                            {formatYen(totalAssets)}
                                        </div>
                                    </div>
                                    <div className="rounded-xl p-3.5" style={{ background: T.pageBg }}>
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: T.muted }}>1日あたり</div>
                                        <div className="font-mono text-[17px] font-extrabold tabular-nums" style={{ color: T.text }}>
                                            {formatYen(Math.round(netDailyExpense))}
                                        </div>
                                        <div className="mt-0.5 text-[10px] tabular-nums" style={{ color: T.muted }}>
                                            {Math.round(netDailyExpense / 1000 * 60 * 24 / 60)}分 / 1,000円
                                        </div>
                                    </div>
                                    <div
                                        className="rounded-xl p-3.5"
                                        style={{
                                            background: MOCK.todayExpense === 0
                                                ? `color-mix(in srgb, ${T.income} 10%, white)`
                                                : T.pageBg,
                                        }}
                                    >
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: T.muted }}>今日</div>
                                        <div
                                            className="font-mono text-[17px] font-extrabold tabular-nums"
                                            style={{ color: MOCK.todayExpense === 0 ? T.income : T.expense }}
                                        >
                                            {formatYen(MOCK.todayExpense)}
                                        </div>
                                    </div>
                                    <div className="rounded-xl p-3.5" style={{ background: T.pageBg }}>
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: T.muted }}>昨日</div>
                                        <div className="font-mono text-[17px] font-extrabold tabular-nums" style={{ color: T.text }}>
                                            {formatYen(MOCK.yesterdayExpense)}
                                        </div>
                                    </div>
                                </div>

                                {/* 予測精度バー */}
                                <div className="mt-5 border-t pt-4" style={{ borderColor: T.border }}>
                                    <div
                                        className="mb-2 flex justify-between text-[10.5px] font-bold uppercase tracking-[0.12em]"
                                        style={{ color: T.muted }}
                                    >
                                        <span>予測の精度</span>
                                        <span>{MOCK.recordedDays}日分の実績</span>
                                    </div>
                                    <div
                                        className="h-1 overflow-hidden rounded-full"
                                        style={{ background: "rgba(28,20,16,0.10)" }}
                                    >
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: T.brand }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (MOCK.recordedDays / 90) * 100)}%` }}
                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </div>
                                </div>

                                {/* ゼロ連続ストリーク */}
                                {MOCK.zeroStreakDays >= 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mt-3 flex items-center gap-2.5 rounded-xl p-3"
                                        style={{ background: `color-mix(in srgb, ${T.income} 10%, white)` }}
                                    >
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ background: T.income }}
                                        />
                                        <span className="text-[12.5px] font-semibold" style={{ color: T.income }}>
                                            {MOCK.zeroStreakDays}日連続で支出ゼロ — 着実に余裕が積み上がっています
                                        </span>
                                    </motion.div>
                                )}

                                {/* 連続記録 */}
                                {MOCK.recordingStreak >= 2 && MOCK.zeroStreakDays < 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2"
                                        style={{ background: `color-mix(in srgb, ${T.brand} 10%, white)` }}
                                    >
                                        <Flame size={15} style={{ color: T.brand }} />
                                        <span className="text-[12.5px] font-semibold" style={{ color: T.brand }}>
                                            {MOCK.recordingStreak}日連続記録中
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 右カラム */}
                    <div className="space-y-4">

                        {/* 月の収支 */}
                        <div
                            className="rounded-2xl p-5"
                            style={{ background: T.cardBg, boxShadow: T.shadow }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-[13px] font-bold" style={{ color: T.text }}>月の収支</span>
                                <span className="font-mono text-[12px]" style={{ color: T.muted }}>
                                    {MOCK.monthSummary.label}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {/* 支出 */}
                                <div
                                    className="rounded-xl p-3"
                                    style={{ background: `color-mix(in srgb, ${T.expense} 10%, white)` }}
                                >
                                    <div className="mb-2 flex items-center gap-1">
                                        <Receipt size={10} style={{ color: T.expense }} />
                                        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: T.expense }}>支出</span>
                                    </div>
                                    <div className="font-mono text-[15px] font-extrabold tabular-nums" style={{ color: T.expense }}>
                                        {formatYen(MOCK.monthSummary.expense)}
                                    </div>
                                </div>
                                {/* 収入 */}
                                <div
                                    className="rounded-xl p-3"
                                    style={{ background: `color-mix(in srgb, ${T.income} 12%, white)` }}
                                >
                                    <div className="mb-2 flex items-center gap-1">
                                        <Banknote size={10} style={{ color: T.income }} />
                                        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: T.income }}>収入</span>
                                    </div>
                                    <div className="font-mono text-[15px] font-extrabold tabular-nums" style={{ color: T.income }}>
                                        {formatYen(MOCK.monthSummary.income)}
                                    </div>
                                </div>
                                {/* 残り */}
                                <div className="rounded-xl p-3" style={{ background: T.pageBg }}>
                                    <div className="mb-2 flex items-center gap-1">
                                        <Wallet size={10} style={{ color: T.muted }} />
                                        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: T.muted }}>残り</span>
                                    </div>
                                    <div
                                        className="font-mono text-[15px] font-extrabold tabular-nums"
                                        style={{ color: netMonth >= 0 ? T.income : T.danger }}
                                    >
                                        {formatYenSigned(netMonth)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 最近の記録 */}
                        <div
                            className="rounded-2xl p-5"
                            style={{ background: T.cardBg, boxShadow: T.shadow }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-[13px] font-bold" style={{ color: T.text }}>最近の記録</span>
                                <span
                                    className="cursor-pointer text-[11px] font-bold transition-opacity hover:opacity-70"
                                    style={{ color: T.brand }}
                                >
                                    すべて見る ›
                                </span>
                            </div>
                            <ul className="space-y-0">
                                {MOCK.recentExpenses.map((it, i) => {
                                    const catName = it.categoryName;
                                    const Icon = categoryIcon(catName);
                                    const acc = categoryAccent(catName);
                                    const isIncome = it.balanceType === 1;
                                    const title = it.content?.trim() || catName;
                                    return (
                                        <motion.li
                                            key={it.id}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="flex items-center gap-3 py-3"
                                            style={{
                                                borderBottom: i < MOCK.recentExpenses.length - 1
                                                    ? `1px solid ${T.border}`
                                                    : "none",
                                            }}
                                        >
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                                style={{ background: acc.bg, color: acc.fg }}
                                            >
                                                <Icon size={16} aria-hidden />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div
                                                    className="truncate text-[13px] font-semibold"
                                                    style={{ color: T.text }}
                                                >
                                                    {title}
                                                </div>
                                                <div className="text-[11px] tabular-nums" style={{ color: T.muted }}>
                                                    {it.date} · {catName}
                                                </div>
                                            </div>
                                            <div
                                                className="shrink-0 font-mono text-[13.5px] font-extrabold tabular-nums"
                                                style={{ color: isIncome ? T.income : T.text }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.97 }}
                className="fixed right-5 z-40 flex h-14 items-center gap-2 rounded-full px-5 text-[14px] font-bold text-white shadow-xl md:right-8"
                style={{
                    bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
                    background: T.brand,
                    boxShadow: `0 8px 24px color-mix(in srgb, ${T.brand} 40%, transparent)`,
                }}
                aria-label="記録する"
            >
                <Plus size={18} strokeWidth={2.5} />
                記録する
            </motion.button>

            {/* ─── 支出記録 Drawer ───────────────────────────────────────────── */}
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-40" style={{ background: "rgba(28,20,16,0.4)" }} />
                    <Drawer.Content
                        className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-2xl pb-8 outline-none"
                        style={{ background: T.cardBg, borderTop: `2px solid ${T.border}` }}
                    >
                        <div
                            className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full"
                            style={{ background: "rgba(28,20,16,0.15)" }}
                        />
                        <div className="border-b px-5 pb-4 pt-3" style={{ borderColor: T.border }}>
                            <Drawer.Title className="text-[17px] font-extrabold" style={{ color: T.text }}>
                                支出を記録
                            </Drawer.Title>
                            <p className="text-sm" style={{ color: T.muted }}>金額を入力してカテゴリを選択してください。</p>
                        </div>
                        <div className="overflow-y-auto px-5 pt-5">
                            <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[11px] font-bold uppercase tracking-wide"
                                        style={{ color: T.muted }}
                                        htmlFor="drawer-amount"
                                    >
                                        金額
                                    </label>
                                    <input
                                        id="drawer-amount"
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        required
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        className="flex h-13 w-full rounded-xl px-4 text-xl font-bold tabular-nums outline-none"
                                        style={{
                                            border: `2px solid ${T.border}`,
                                            background: T.pageBg,
                                        }}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[11px] font-bold uppercase tracking-wide"
                                        style={{ color: T.muted }}
                                        htmlFor="drawer-cat"
                                    >
                                        カテゴリ
                                    </label>
                                    <select
                                        id="drawer-cat"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="flex h-11 w-full rounded-xl px-3 text-sm font-medium outline-none"
                                        style={{ border: `2px solid ${T.border}`, background: T.pageBg }}
                                    >
                                        {EXPENSE_CATEGORIES.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[11px] font-bold uppercase tracking-wide"
                                        style={{ color: T.muted }}
                                        htmlFor="drawer-note"
                                    >
                                        メモ（任意）
                                    </label>
                                    <input
                                        id="drawer-note"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="flex h-10 w-full rounded-xl px-3 text-sm outline-none"
                                        style={{ border: `2px solid ${T.border}`, background: T.pageBg }}
                                        placeholder="店名・用途など"
                                    />
                                </div>
                                <div className="flex gap-2.5 pb-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex-1 rounded-xl py-3 text-sm font-bold transition-colors hover:opacity-80"
                                        style={{
                                            border: `2px solid ${T.border}`,
                                            background: T.pageBg,
                                            color: `${T.text}99`,
                                        }}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitted}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                        style={{ background: T.brand }}
                                    >
                                        {submitted ? "送信中…" : <><Check size={15} />記録する</>}
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
