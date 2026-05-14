/**
 * HomeV4Prototype — ホーム画面 V4（framer-motion 本格活用版）
 *
 * Animation philosophy:
 *   SNAP   (stiffness 600): numpad キー・アイコンボタン — 即時フィードバック < 150ms
 *   QUICK  (stiffness 400): バッジ・セグメント・サブアクション — 200ms
 *   BASE   (stiffness 300): カード・ドロワータブ — 300ms
 *   SMOOTH (stiffness 200): ページ入場カード — 400ms
 *   BAR    (stiffness 70):  プログレスバー — 800ms（先行視感）
 *
 * Rules:
 *   - すべて spring。ease カーブは使わない
 *   - staggerChildren でウォーターフォール入場
 *   - filter: blur でエントランスに奥行き
 *   - 装飾ループアニメーションはゼロ（デバイスイベント起因のみ）
 *   - useReducedMotion を尊重
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    animate,
    motion,
    AnimatePresence,
    useMotionValue,
    useSpring,
    useScroll,
    useTransform,
    useReducedMotion,
} from "framer-motion";

// motion() でラップした Link — framer-motion アニメーション + React Router ナビを両立
const MotionLink = motion(Link);
import { Drawer } from "vaul";
import {
    Home, Calendar, BarChart2, Settings,
    Bell, Plus, Check, Receipt,
    Wallet, Banknote, ShoppingBasket, ShoppingBag,
    CircleDollarSign, Car, Zap, Heart, Tag,
    ChevronRight, Delete, TrendingDown, AlertTriangle,
    X, Flame, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

// ─── デザイントークン ─────────────────────────────────────────────────────

const R = {
    card:  "16px",
    inner: "10px",
    badge: "9999px",
    input: "12px",
} as const;

const C = {
    bg:            "#fffdf5",
    card:          "#ffffff",
    text:          "#1c1410",
    muted:         "rgba(28,20,16,0.42)",
    border:        "rgba(28,20,16,0.08)",
    borderStrong:  "rgba(28,20,16,0.14)",
    shadow:        "0 1px 3px rgba(28,20,16,0.06), 0 0 0 1px rgba(28,20,16,0.06)",
    shadowMd:      "0 4px 16px rgba(28,20,16,0.09), 0 0 0 1px rgba(28,20,16,0.06)",
    brand:         "#f18840",
    brandDeep:     "#e8622a",
    brandLight:    "#fff6ee",
    income:        "#35b5a2",
    incomeDeep:    "#22a090",
    incomeLight:   "#ecfaf8",
    safe:    { bg: "#f8faf8", border: "rgba(196,181,165,0.5)",  hero: "#6b5b52", badge: "#c4b5a5", label: "余裕",  glow: "rgba(107,91,82,0.12)"  },
    caution: { bg: "#fef4f4", border: "rgba(248,113,113,0.35)", hero: "#b91c1c", badge: "#f87171", label: "注意",  glow: "rgba(248,113,113,0.16)" },
    danger:  { bg: "#fff1f2", border: "rgba(244,63,94,0.35)",   hero: "#9f1239", badge: "#f43f5e", label: "ピンチ", glow: "rgba(244,63,94,0.18)"  },
} as const;

// ─── Spring プリセット ──────────────────────────────────────────────────────

const SPRING = {
    snap:   { type: "spring", stiffness: 600, damping: 35 } as const, // < 150ms
    quick:  { type: "spring", stiffness: 400, damping: 30 } as const, // 200ms
    base:   { type: "spring", stiffness: 300, damping: 28 } as const, // 300ms
    smooth: { type: "spring", stiffness: 200, damping: 26 } as const, // 400ms
    bar:    { type: "spring", stiffness: 70,  damping: 18 } as const, // 800ms+
} as const;

// ─── Animation Variants ────────────────────────────────────────────────────

/** ページ入場: カード群のウォーターフォール */
const PAGE = {
    container: {
        hidden:  {},
        visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
    },
    item: {
        hidden:  { opacity: 0, y: 22, filter: "blur(8px)" },
        visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: SPRING.smooth },
    },
};

/** リスト行: 左から blur + x スライド */
const LIST = {
    container: {
        hidden:  {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
    },
    item: {
        hidden:  { opacity: 0, x: -10, filter: "blur(4px)" },
        visible: { opacity: 1, x: 0,   filter: "blur(0px)", transition: SPRING.base },
    },
};

/** Drawer 内セクション: 上から */
const DRAWER_ANIM = {
    container: {
        hidden:  {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
    },
    item: {
        hidden:  { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: SPRING.quick },
    },
};

// ─── モックデータ ────────────────────────────────────────────────────────────

const MOCK = {
    userId:         "Y",
    todayExpense:   1280,
    recordingStreak: 6,
    avgDailyExpense: 9800,
    totalAssets:    999853,
    monthlyIncome:  252600,
    dailyBudget:    7692,
    daysUntilPayday: 13,
    monthSummary:   { label: "2026 / 05", expense: 148700, income: 252600 },
    recentExpenses: [
        { id: "1", date: "2026-05-15", amount: 1280,  balanceType: 0, categoryName: "食費",   content: "スーパー" },
        { id: "2", date: "2026-05-15", amount: 550,   balanceType: 0, categoryName: "交通費", content: "電車" },
        { id: "3", date: "2026-05-14", amount: 3200,  balanceType: 0, categoryName: "日用品", content: "ドラッグストア" },
        { id: "4", date: "2026-05-14", amount: 800,   balanceType: 0, categoryName: "食費",   content: "コンビニ" },
        { id: "5", date: "2026-05-13", amount: 50000, balanceType: 1, categoryName: "給料",   content: "5月給与（一部）" },
        { id: "6", date: "2026-05-12", amount: 20000, balanceType: 0, categoryName: "日用品", content: "生活用品まとめ買い" },
    ],
    alerts: [
        { id: "a1", type: "caution" as const, message: "今月の食費が先月比 +23% です" },
        { id: "a2", type: "danger"  as const, message: "固定費の引き落とし予定日まで3日" },
    ],
};

const EXPENSE_CATEGORIES = [
    { id: 1,  name: "食費",   icon: ShoppingBasket, color: C.brand     },
    { id: 2,  name: "日用品", icon: ShoppingBag,    color: "#a855f7"   },
    { id: 3,  name: "交通費", icon: Car,            color: "#3b82f6"   },
    { id: 4,  name: "光熱費", icon: Zap,            color: "#ca8a04"   },
    { id: 5,  name: "娯楽費", icon: Tag,            color: "#ec4899"   },
    { id: 6,  name: "医療費", icon: Heart,          color: "#ef4444"   },
    { id: 7,  name: "その他", icon: Tag,            color: C.muted     },
];
const INCOME_CATEGORIES = [
    { id: 10, name: "給料",   icon: Banknote,       color: C.income    },
    { id: 11, name: "副収入", icon: ArrowUpRight,   color: "#6366f1"   },
    { id: 12, name: "その他", icon: Tag,            color: C.muted     },
];

// ─── ユーティリティ ────────────────────────────────────────────────────────

function formatYen(n: number) { return `¥${Math.round(n).toLocaleString("ja-JP")}`; }
function formatYenSigned(n: number) {
    return `${n >= 0 ? "+" : "−"}¥${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;
}
type Tone = "safe" | "caution" | "danger";
function budgetTone(ratio: number): Tone {
    if (ratio >= 0.8) return "safe";
    if (ratio >= 0.2) return "caution";
    return "danger";
}
function calcEndDate(assets: number, netDaily: number): string | null {
    if (netDaily <= 0) return null;
    const days = Math.floor(assets / netDaily);
    const d = new Date(2026, 4, 15);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}
function categoryAccent(name: string) {
    if (name.includes("食"))                              return { bg: "#fff6ee", fg: C.brand   };
    if (name.includes("日用品") || name.includes("生活")) return { bg: "#faf5ff", fg: "#a855f7" };
    if (name.includes("交通"))                            return { bg: "#eff6ff", fg: "#3b82f6" };
    if (name.includes("給") || name.includes("収"))       return { bg: C.incomeLight, fg: C.income };
    return { bg: "rgba(28,20,16,0.05)", fg: C.muted };
}
function categoryIconComp(name: string) {
    if (name.includes("食"))                              return ShoppingBasket;
    if (name.includes("日用品") || name.includes("生活")) return ShoppingBag;
    if (name.includes("交通"))                            return Car;
    if (name.includes("光熱"))                            return Zap;
    if (name.includes("給") || name.includes("収"))       return CircleDollarSign;
    return Tag;
}

// ─── SpringNumber — マウント時 0 からカウントアップ ──────────────────────

function SpringNumber({
    value,
    format,
}: {
    value: number;
    format: (n: number) => string;
}) {
    const shouldReduce = useReducedMotion();
    const mv      = useMotionValue(0);
    const spring_ = useSpring(mv, { stiffness: 350, damping: 30 });
    const [display, setDisplay] = useState(shouldReduce ? format(value) : format(0));
    const prev = useRef(0); // 0 からスタートしてカウントアップ

    useEffect(() => {
        if (shouldReduce) { setDisplay(format(value)); return; }
        const ctrl = animate(prev.current, value, {
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(format(v)),
        });
        prev.current = value;
        return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    void spring_;
    return <>{display}</>;
}

// ─── ProgressBar — spring fill ──────────────────────────────────────────────

function ProgressBar({
    pct,
    gradient,
    delay = 0,
    height = "h-2",
    trackColor = "rgba(28,20,16,0.07)",
}: {
    pct: number;
    gradient: string;
    delay?: number;
    height?: string;
    trackColor?: string;
}) {
    return (
        <div
            className={`${height} overflow-hidden`}
            style={{ background: trackColor, borderRadius: R.badge }}
        >
            <motion.div
                className="h-full"
                style={{ background: gradient, borderRadius: R.badge }}
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                transition={{ ...SPRING.bar, delay }}
            />
        </div>
    );
}

// ─── テンキーパッド ────────────────────────────────────────────────────────

function Numpad({ onKey }: { onKey: (k: string) => void }) {
    const keys = ["1","2","3","4","5","6","7","8","9","000","0","⌫"];
    return (
        <div className="grid grid-cols-3 gap-1.5">
            {keys.map((k) => (
                <motion.button
                    key={k}
                    type="button"
                    onClick={() => onKey(k)}
                    whileTap={{ scale: 0.84 }}
                    transition={SPRING.snap}
                    className="flex h-10 items-center justify-center text-[16px] font-semibold tap-highlight select-none"
                    style={{
                        borderRadius: R.inner,
                        background:   k === "⌫" ? "#fff0ea" : C.card,
                        color:        k === "⌫" ? C.brand   : C.text,
                        border:       `1px solid ${C.border}`,
                        boxShadow:    "0 1px 3px rgba(28,20,16,0.06)",
                    }}
                >
                    {k === "⌫" ? <Delete size={19} /> : k}
                </motion.button>
            ))}
        </div>
    );
}

// ─── 日付グルーピング ──────────────────────────────────────────────────────

type Expense = typeof MOCK.recentExpenses[number];
function groupByDate(list: Expense[]) {
    const today = "2026-05-15", yesterday = "2026-05-14";
    const map = new Map<string, Expense[]>();
    for (const it of list) {
        const arr = map.get(it.date) ?? [];
        arr.push(it);
        map.set(it.date, arr);
    }
    return Array.from(map.entries()).map(([date, items]) => ({
        date, items,
        label: date === today ? "今日" : date === yesterday ? "昨日" : date,
    }));
}

// ─── メインコンポーネント ────────────────────────────────────────────────────

export function HomeV4Prototype() {
    const shouldReduce = useReducedMotion();

    const [totalAssets]   = useState(MOCK.totalAssets);
    const [monthlyIncome] = useState(MOCK.monthlyIncome);
    const [drawerOpen, setDrawerOpen]   = useState(false);
    const [amountStr, setAmountStr]     = useState("");
    const [categoryId, setCategoryId]   = useState(1);
    const [noteText, setNoteText]       = useState("");
    const [submitted, setSubmitted]     = useState(false);
    const [balanceType, setBalanceType] = useState<0 | 1>(0);
    const [alerts, setAlerts]           = useState(MOCK.alerts);

    // ヘッダーのスクロール shadow
    const { scrollY } = useScroll();
    const headerShadow = useTransform(
        scrollY, [0, 32],
        ["0 0 0 0 transparent", "0 2px 12px rgba(28,20,16,0.09)"],
    );
    const headerBorderOpacity = useTransform(scrollY, [0, 32], [0.08, 0.18]);

    const netDailyExpense = Math.max(0, MOCK.avgDailyExpense - monthlyIncome / 30);
    const endDateLabel    = useMemo(() => calcEndDate(totalAssets, netDailyExpense), [totalAssets, netDailyExpense]);
    const netMonth        = MOCK.monthSummary.income - MOCK.monthSummary.expense;
    const savingsRate     = Math.round((netMonth / MOCK.monthSummary.income) * 100);

    const remaining  = Math.max(0, MOCK.dailyBudget - MOCK.todayExpense);
    const ratio      = MOCK.dailyBudget > 0 ? remaining / MOCK.dailyBudget : 1;
    const tone       = budgetTone(ratio);
    const fillPct    = Math.round(Math.max(0, Math.min(100, ratio * 100)));
    const ps         = C[tone];

    const dayOfMonth    = 15;
    const daysInMonth   = 31;
    const monthProgress = dayOfMonth / daysInMonth;
    const spendProgress = MOCK.monthSummary.expense / MOCK.monthSummary.income;
    const isOverPace    = spendProgress > monthProgress;

    const grouped    = useMemo(() => groupByDate(MOCK.recentExpenses), []);
    const categories = balanceType === 0 ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const previewRemaining = balanceType === 0
        ? Math.max(0, remaining - (Number(amountStr) || 0))
        : null;

    function handleNumKey(k: string) {
        if (k === "⌫")   { setAmountStr((p) => p.slice(0, -1)); return; }
        if (k === "000")  { setAmountStr((p) => p === "" ? p : p + "000"); return; }
        setAmountStr((p) => {
            const next = p + k;
            return Number(next) > 9_999_999 ? p : next;
        });
    }

    function handleOpenDrawer() {
        setAmountStr(""); setCategoryId(1); setNoteText("");
        setSubmitted(false); setBalanceType(0); setDrawerOpen(true);
    }

    function handleSubmit() {
        if (!Number(amountStr)) return;
        setSubmitted(true);
        setTimeout(() => { setDrawerOpen(false); setSubmitted(false); }, 800);
    }

    // reduceMotion 対応: アニメーション無効化
    const pageVariants = shouldReduce
        ? { hidden: {}, visible: {} }
        : PAGE;
    const itemVariants = shouldReduce
        ? { hidden: {}, visible: {} }
        : PAGE.item;
    const listVariants = shouldReduce
        ? { hidden: {}, visible: {} }
        : LIST;
    const listItemVariants = shouldReduce
        ? { hidden: {}, visible: {} }
        : LIST.item;

    return (
        <div className="min-h-screen pb-28 tap-highlight" style={{ background: C.bg, color: C.text }}>

            {/* ─── ヘッダー ────────────────────────────────────────────── */}
            <motion.header
                className="glass sticky top-0 z-20 flex h-14 items-center border-b px-4 md:px-6"
                style={{
                    borderColor: `rgba(28,20,16,${headerBorderOpacity})`,
                    boxShadow: headerShadow,
                }}
            >
                <div className="flex items-center gap-2.5 shrink-0">
                    <img src="/logo192.png" alt="家計かんり" className="h-8 w-8 shrink-0" style={{ borderRadius: "10px" }} />
                    <span className="text-[15px] font-extrabold tracking-tight" style={{ color: C.text }}>家計かんり</span>
                </div>

                <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
                    {[
                        { label: "ホーム",     icon: Home,     to: "/home-v4",           active: true  },
                        { label: "カレンダー", icon: Calendar,  to: "/calendar-page",     active: false },
                        { label: "レポート",   icon: BarChart2, to: "/asset-outlook-ab",  active: false },
                        { label: "設定",       icon: Settings,  to: "/personal-settings", active: false },
                    ].map((item) => (
                        <MotionLink
                            key={item.label}
                            to={item.to}
                            whileTap={{ scale: 0.95 }}
                            transition={SPRING.snap}
                            className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold tap-highlight"
                            style={{
                                borderRadius: "10px",
                                background: item.active ? C.brandLight : "transparent",
                                color:      item.active ? C.brand : "rgba(28,20,16,0.50)",
                                textDecoration: "none",
                            }}
                        >
                            <item.icon size={14} aria-hidden />
                            {item.label}
                        </MotionLink>
                    ))}
                </nav>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                    <MotionLink
                        to="/notifications"
                        whileTap={{ scale: 0.82 }}
                        transition={SPRING.snap}
                        className="relative flex h-8 w-8 items-center justify-center tap-highlight"
                        style={{ color: "rgba(28,20,16,0.45)", borderRadius: "8px" }}
                        aria-label="通知"
                    >
                        <Bell size={17} />
                        <AnimatePresence>
                            {alerts.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={SPRING.quick}
                                    className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white"
                                    style={{ background: "#f43f5e" }}
                                />
                            )}
                        </AnimatePresence>
                    </MotionLink>
                    <MotionLink
                        to="/personal-settings"
                        whileTap={{ scale: 0.90 }}
                        transition={SPRING.snap}
                        className="flex h-8 w-8 items-center justify-center text-[12px] font-extrabold text-white tap-highlight"
                        style={{
                            background:   `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`,
                            borderRadius: R.badge,
                            boxShadow:    "0 2px 8px rgba(241,136,64,0.30)",
                            textDecoration: "none",
                        }}
                        aria-label="設定"
                    >
                        {MOCK.userId}
                    </MotionLink>
                </div>
            </motion.header>

            <main className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-5">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px] lg:items-start">

                    {/* ── 左カラム ─────────────────────────────────────── */}
                    <motion.div
                        className="space-y-3"
                        variants={pageVariants.container ?? PAGE.container}
                        initial="hidden"
                        animate="visible"
                    >

                        {/* 今日使えるお金 */}
                        <motion.div
                            variants={itemVariants}
                            className="border-2 p-5 overflow-hidden"
                            style={{
                                borderRadius: R.card,
                                background:   ps.bg,
                                borderColor:  ps.border,
                                boxShadow:    C.shadow,
                            }}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(28,20,16,0.40)" }}>
                                    今日使えるお金
                                </span>
                                <motion.span
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ ...SPRING.quick, delay: 0.35 }}
                                    className="px-3 py-0.5 text-xs font-bold text-white"
                                    style={{ background: ps.badge, borderRadius: R.badge }}
                                >
                                    {ps.label}
                                </motion.span>
                            </div>

                            {/* ヒーロー数値 */}
                            <p
                                className="mb-1 hero-number leading-none"
                                style={{ color: ps.hero, letterSpacing: "-0.03em", fontSize: "clamp(2.8rem, 8vw, 4rem)", fontWeight: 900 }}
                            >
                                <SpringNumber value={remaining} format={formatYen} />
                            </p>
                            <p className="mb-4 text-xs" style={{ color: "rgba(28,20,16,0.46)" }}>
                                1日予算 <span className="font-bold tabular-nums">{formatYen(MOCK.dailyBudget)}</span>
                                <span className="mx-1.5 opacity-30">·</span>
                                本日支出 <span className="font-bold tabular-nums">{formatYen(MOCK.todayExpense)}</span>
                            </p>

                            {/* 残りバー */}
                            <div className="mb-4">
                                <div className="mb-1.5 flex justify-between text-[11px]" style={{ color: "rgba(28,20,16,0.40)" }}>
                                    <span>本日残り</span>
                                    <span className="font-semibold tabular-nums">{fillPct}%</span>
                                </div>
                                <ProgressBar
                                    pct={fillPct}
                                    delay={0.5}
                                    height="h-2.5"
                                    trackColor={`color-mix(in srgb, ${ps.border} 50%, transparent)`}
                                    gradient={
                                        tone === "safe"
                                            ? `linear-gradient(90deg, #a8a09a, ${ps.hero})`
                                            : tone === "caution"
                                                ? "linear-gradient(90deg, #fca5a5, #f87171)"
                                                : "linear-gradient(90deg, #fb7185, #f43f5e)"
                                    }
                                />
                            </div>

                            {/* 今月のペース */}
                            <div
                                className="rounded-xl p-3.5"
                                style={{
                                    background: C.card,
                                    border:     `1px solid ${C.border}`,
                                    boxShadow:  "0 1px 4px rgba(28,20,16,0.04)",
                                }}
                            >
                                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold" style={{ color: C.muted }}>
                                    <span>今月のペース</span>
                                    <span
                                        className="px-2 py-0.5 text-[10px] font-bold"
                                        style={{
                                            borderRadius: R.badge,
                                            background: isOverPace ? "rgba(244,63,94,0.09)" : "rgba(53,181,162,0.09)",
                                            color:      isOverPace ? "#f43f5e" : C.income,
                                        }}
                                    >
                                        {isOverPace ? "ペース超過" : "順調"}
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    <div>
                                        <div className="mb-1.5 flex justify-between text-[10px]" style={{ color: C.muted }}>
                                            <span>支出の進み</span>
                                            <span className="font-semibold tabular-nums" style={{ color: isOverPace ? "#f43f5e" : C.income }}>
                                                {formatYen(MOCK.monthSummary.expense)} / {formatYen(MOCK.monthSummary.income)}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <ProgressBar
                                                pct={Math.min(100, Math.round(spendProgress * 100))}
                                                delay={0.65}
                                                gradient={
                                                    isOverPace
                                                        ? "linear-gradient(90deg, #fb7185, #f43f5e)"
                                                        : "linear-gradient(90deg, #34d399, #35b5a2)"
                                                }
                                            />
                                            {/* 日数マーカー */}
                                            <div
                                                className="absolute top-0 h-full w-0.5"
                                                style={{
                                                    left:       `${Math.round(monthProgress * 100)}%`,
                                                    background: "rgba(28,20,16,0.25)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-right text-[10px]" style={{ color: C.muted }}>
                                    {dayOfMonth}日経過 / {daysInMonth}日
                                </div>
                            </div>

                            {/* フッター */}
                            <div className="mt-3.5 flex items-center justify-between">
                                <span className="text-xs" style={{ color: "rgba(28,20,16,0.50)" }}>
                                    給料日まで <span className="font-bold">あと {MOCK.daysUntilPayday} 日</span>
                                </span>
                                {MOCK.recordingStreak >= 2 && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ ...SPRING.base, delay: 0.5 }}
                                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold"
                                        style={{ background: C.brandLight, color: C.brand, borderRadius: R.badge }}
                                    >
                                        <Flame size={11} />
                                        {MOCK.recordingStreak}日連続記録中
                                    </motion.span>
                                )}
                            </div>
                        </motion.div>

                        {/* アラートチップ */}
                        <AnimatePresence>
                            {alerts.map((alert) => {
                                const aColor = alert.type === "danger" ? "#f43f5e" : "#f59e0b";
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -12, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: "auto" }}
                                        exit={{ opacity: 0, x: 20, height: 0 }}
                                        transition={SPRING.base}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div
                                            className="flex items-center gap-2.5 px-3.5 py-2.5 border mb-0"
                                            style={{
                                                borderRadius: R.inner,
                                                borderColor:  `color-mix(in srgb, ${aColor} 22%, transparent)`,
                                                background:   `color-mix(in srgb, ${aColor} 5%, white)`,
                                            }}
                                        >
                                            {alert.type === "danger"
                                                ? <TrendingDown  size={12} style={{ color: aColor, flexShrink: 0 }} />
                                                : <AlertTriangle size={12} style={{ color: aColor, flexShrink: 0 }} />
                                            }
                                            <span className="flex-1 text-xs font-medium" style={{ color: C.text + "cc" }}>
                                                {alert.message}
                                            </span>
                                            <motion.button
                                                type="button"
                                                whileTap={{ scale: 0.78 }}
                                                transition={SPRING.snap}
                                                onClick={() => setAlerts((p) => p.filter((a) => a.id !== alert.id))}
                                                style={{ color: C.muted }}
                                                aria-label="閉じる"
                                            >
                                                <X size={13} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* 最近の記録 */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden border"
                            style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                        >
                            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: C.border }}>
                                <span className="text-sm font-bold" style={{ color: C.text }}>最近の記録</span>
                                <MotionLink
                                    to="/recent-records-ab"
                                    whileTap={{ scale: 0.92 }}
                                    transition={SPRING.snap}
                                    className="flex items-center gap-0.5 text-[12px] font-semibold tap-highlight"
                                    style={{ color: C.brand, textDecoration: "none" }}
                                >
                                    すべて見る <ChevronRight size={12} />
                                </MotionLink>
                            </div>

                            <div>
                                {grouped.map((group) => (
                                    <div key={group.date}>
                                        <div
                                            className="px-4 py-1.5 text-[11px] font-bold"
                                            style={{
                                                background: C.bg,
                                                color: C.muted,
                                                borderBottom: `1px solid ${C.border}`,
                                            }}
                                        >
                                            {group.label}
                                        </div>
                                        <motion.ul
                                            variants={listVariants.container ?? LIST.container}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            {group.items.map((it, i) => {
                                                const acc    = categoryAccent(it.categoryName);
                                                const Icon   = categoryIconComp(it.categoryName);
                                                const isIncome = it.balanceType === 1;
                                                return (
                                                    <motion.li
                                                        key={it.id}
                                                        variants={listItemVariants}
                                                        className="flex items-center gap-3 px-4 py-3 tap-highlight"
                                                        style={{
                                                            borderBottom: i < group.items.length - 1
                                                                ? `1px solid ${C.border}`
                                                                : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className="flex h-9 w-9 shrink-0 items-center justify-center"
                                                            style={{ background: acc.bg, color: acc.fg, borderRadius: "10px" }}
                                                        >
                                                            <Icon size={16} aria-hidden />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-[13px] font-semibold" style={{ color: C.text }}>
                                                                {it.content?.trim() || it.categoryName}
                                                            </div>
                                                            <div className="text-[11px]" style={{ color: C.muted }}>
                                                                {it.categoryName}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="shrink-0 hero-number text-[14px] font-extrabold"
                                                            style={{ color: isIncome ? C.income : C.text }}
                                                        >
                                                            {isIncome ? "+" : "−"}¥{it.amount.toLocaleString("ja-JP")}
                                                        </div>
                                                    </motion.li>
                                                );
                                            })}
                                        </motion.ul>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* ── 右カラム ─────────────────────────────────────── */}
                    <motion.div
                        className="space-y-3"
                        variants={pageVariants.container ?? PAGE.container}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* 今月の貯蓄 */}
                        <motion.div
                            variants={itemVariants}
                            className="border p-4 overflow-hidden relative"
                            style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                        >
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-[13px] font-bold" style={{ color: C.text }}>今月の貯蓄</span>
                                <span className="font-mono text-[11px]" style={{ color: C.muted }}>{MOCK.monthSummary.label}</span>
                            </div>
                            <div className="mb-3 flex items-end gap-2">
                                <span className="hero-number text-3xl font-black" style={{ color: C.income, letterSpacing: "-0.02em" }}>
                                    <SpringNumber value={netMonth} format={formatYen} />
                                </span>
                                <motion.span
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...SPRING.base, delay: 0.6 }}
                                    className="mb-0.5 flex items-center gap-0.5 text-xs font-semibold"
                                    style={{ color: savingsRate >= 20 ? C.income : "#f59e0b" }}
                                >
                                    <ArrowUpRight size={12} />
                                    {savingsRate}%
                                </motion.span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: "収入", value: formatYen(MOCK.monthSummary.income), color: C.income, icon: ArrowUpRight },
                                    { label: "支出", value: formatYen(MOCK.monthSummary.expense), color: C.brand, icon: ArrowDownRight },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-[11px]" style={{ color: item.color }}>
                                            <item.icon size={11} />
                                            {item.label}
                                        </span>
                                        <span className="hero-number text-[13px] font-bold tabular-nums" style={{ color: C.text }}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 flex items-center justify-between" style={{ borderColor: C.border }}>
                                    <span className="flex items-center gap-1 text-[11px]" style={{ color: C.muted }}>
                                        <Wallet size={10} />収支差
                                    </span>
                                    <span
                                        className="hero-number text-[13px] font-extrabold tabular-nums"
                                        style={{ color: netMonth >= 0 ? C.income : "#f43f5e" }}
                                    >
                                        {formatYenSigned(netMonth)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <ProgressBar
                                    pct={Math.min(100, Math.round((MOCK.monthSummary.expense / MOCK.monthSummary.income) * 100))}
                                    delay={0.7}
                                    trackColor={C.incomeLight}
                                    gradient={
                                        spendProgress > 0.85
                                            ? "linear-gradient(90deg, #fb7185, #f43f5e)"
                                            : "linear-gradient(90deg, #f18840, #e8622a)"
                                    }
                                />
                                <div className="mt-1 text-right text-[10px] tabular-nums" style={{ color: C.muted }}>
                                    {Math.round((MOCK.monthSummary.expense / MOCK.monthSummary.income) * 100)}% 消化
                                </div>
                            </div>
                        </motion.div>

                        {/* 資産の見通し */}
                        <motion.div
                            variants={itemVariants}
                            className="border p-4"
                            style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                        >
                            <div className="mb-3 text-[13px] font-bold" style={{ color: C.text }}>資産の見通し</div>
                            <div
                                className="flex flex-col items-center justify-center py-5 rounded-xl"
                                style={{ background: C.incomeLight }}
                            >
                                <div className="text-[10px] font-semibold mb-2" style={{ color: C.muted }}>
                                    今のペースで資産が尽きる時期
                                </div>
                                {endDateLabel ? (
                                    <motion.div
                                        className="hero-number text-2xl font-extrabold"
                                        style={{ color: C.income, letterSpacing: "-0.02em" }}
                                        initial={{ opacity: 0, scale: 0.88 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ ...SPRING.base, delay: 0.5 }}
                                    >
                                        {endDateLabel}
                                    </motion.div>
                                ) : (
                                    <div className="text-3xl font-extrabold" style={{ color: C.income }}>∞</div>
                                )}
                                <div className="mt-1 text-[10px]" style={{ color: C.muted }}>
                                    現ペースを継続した場合
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {[
                                    { label: "総資産",    value: formatYen(totalAssets) },
                                    { label: "純日次支出", value: formatYen(Math.round(netDailyExpense)) },
                                ].map((item) => (
                                    <div key={item.label} className="px-3 py-2.5 text-center" style={{ background: C.bg, borderRadius: R.inner }}>
                                        <div className="text-[9px] font-bold mb-1" style={{ color: C.muted }}>{item.label}</div>
                                        <div className="hero-number text-[12px] font-extrabold tabular-nums" style={{ color: C.text }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 比較リンク */}
                        <div className="text-center text-xs" style={{ color: C.muted }}>
                            <Link to="/home-v3" style={{ color: C.brand }} className="font-semibold hover:underline">← V3 と比較</Link>
                            <span className="mx-2 opacity-30">·</span>
                            <Link to="/category-ab" style={{ color: C.brand }} className="font-semibold hover:underline">カテゴリ比較 →</Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* ─── FAB ─────────────────────────────────────────────────── */}
            <motion.button
                type="button"
                onClick={handleOpenDrawer}
                initial={{ opacity: 0, scale: 0.6, y: 24 }}
                animate={{ opacity: 1, scale: 1,   y: 0  }}
                transition={{ ...SPRING.smooth, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.91 }}
                className="fixed right-5 z-40 flex h-14 items-center gap-2 px-6 text-sm font-bold text-white tap-highlight"
                style={{
                    bottom:       "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
                    background:   `linear-gradient(135deg, ${C.brand} 0%, ${C.brandDeep} 100%)`,
                    borderRadius: R.badge,
                    boxShadow:    "0 4px 20px rgba(241,136,64,0.32), 0 1px 4px rgba(241,136,64,0.20)",
                }}
                aria-label="記録する"
            >
                <Plus size={18} strokeWidth={2.5} />
                記録する
            </motion.button>

            {/* ─── Drawer ──────────────────────────────────────────────── */}
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(28,20,16,0.36)", backdropFilter: "blur(4px)" }}
                    />
                    <Drawer.Content
                        className="fixed bottom-0 left-0 right-0 z-50 outline-none"
                        style={{
                            background:   C.card,
                            borderTop:    `1px solid ${C.border}`,
                            borderRadius: "22px 22px 0 0",
                            maxHeight:    "94dvh",
                            boxShadow:    "0 -8px 40px rgba(28,20,16,0.14)",
                        }}
                    >
                        {/* ドラッグハンドル */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="h-1 w-10 rounded-full" style={{ background: "rgba(28,20,16,0.12)" }} />
                        </div>

                        {/* Drawer 内コンテンツ: stagger 入場 */}
                        <motion.div
                            className="overflow-y-auto"
                            style={{ maxHeight: "calc(94dvh - 28px)" }}
                            variants={DRAWER_ANIM.container}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* 収入 / 支出 セグメントコントロール */}
                            <motion.div className="px-4 pb-3" variants={DRAWER_ANIM.item}>
                                <div className="flex p-1 rounded-xl" style={{ background: "rgba(28,20,16,0.06)" }}>
                                    {([0, 1] as const).map((t) => (
                                        <motion.button
                                            key={t}
                                            type="button"
                                            onClick={() => { setBalanceType(t); setCategoryId(t === 0 ? 1 : 10); }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={SPRING.snap}
                                            className="flex-1 py-2 text-sm font-bold relative tap-highlight"
                                            style={{ borderRadius: "10px", zIndex: 1 }}
                                        >
                                            {balanceType === t && (
                                                <motion.div
                                                    layoutId="tab-bg"
                                                    className="absolute inset-0"
                                                    style={{
                                                        borderRadius: "10px",
                                                        background:   t === 0
                                                            ? `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`
                                                            : `linear-gradient(135deg, ${C.income}, ${C.incomeDeep})`,
                                                        boxShadow:    t === 0
                                                            ? "0 2px 10px rgba(241,136,64,0.28)"
                                                            : "0 2px 10px rgba(53,181,162,0.25)",
                                                    }}
                                                    transition={SPRING.base}
                                                />
                                            )}
                                            <span
                                                className="relative z-10"
                                                style={{ color: balanceType === t ? "#fff" : C.muted }}
                                            >
                                                {t === 0 ? "支出" : "収入"}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* 金額表示 */}
                            <motion.div className="mx-4 mb-3" variants={DRAWER_ANIM.item}>
                                <motion.div
                                    layout
                                    className="relative overflow-hidden rounded-2xl px-5 py-4"
                                    style={{
                                        background: balanceType === 0
                                            ? `linear-gradient(135deg, ${C.expenseLight}, #ffe8d6)`
                                            : `linear-gradient(135deg, ${C.incomeLight}, #d4f5ef)`,
                                        border: `1.5px solid ${balanceType === 0 ? "rgba(241,136,64,0.22)" : "rgba(53,181,162,0.22)"}`,
                                    }}
                                    transition={SPRING.base}
                                >
                                    <Drawer.Title className="text-[10px] font-semibold" style={{ color: C.muted }}>
                                        {balanceType === 0 ? "支出金額" : "収入金額"}
                                    </Drawer.Title>
                                    <div
                                        className="hero-number text-4xl font-black mt-1"
                                        style={{
                                            color:          balanceType === 0 ? C.brandDeep : C.incomeDeep,
                                            letterSpacing:  "-0.03em",
                                        }}
                                    >
                                        ¥{amountStr === "" ? "0" : Number(amountStr).toLocaleString("ja-JP")}
                                    </div>
                                    {previewRemaining !== null && amountStr !== "" && Number(amountStr) > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={SPRING.quick}
                                            className="mt-1.5 text-[11px]"
                                            style={{ color: C.muted }}
                                        >
                                            記録後の残り：
                                            <span
                                                className="font-bold tabular-nums ml-0.5"
                                                style={{ color: previewRemaining < MOCK.dailyBudget * 0.2 ? "#f43f5e" : C.text }}
                                            >
                                                {formatYen(previewRemaining)}
                                            </span>
                                        </motion.div>
                                    )}
                                    <AnimatePresence>
                                        {amountStr !== "" && (
                                            <motion.button
                                                type="button"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                whileTap={{ scale: 0.80 }}
                                                transition={SPRING.snap}
                                                onClick={() => setAmountStr("")}
                                                className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full"
                                                style={{ background: "rgba(28,20,16,0.10)", color: C.muted }}
                                                aria-label="クリア"
                                            >
                                                <X size={12} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>

                            {/* カテゴリグリッド */}
                            <motion.div className="px-4 mb-3" variants={DRAWER_ANIM.item}>
                                <div className="text-[10px] font-semibold mb-2" style={{ color: C.muted }}>カテゴリ</div>
                                {/* balanceType 切替でスライドイン */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={balanceType}
                                        initial={{ opacity: 0, x: balanceType === 0 ? -14 : 14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: balanceType === 0 ? 14 : -14 }}
                                        transition={SPRING.base}
                                        className="grid grid-cols-4 gap-2"
                                    >
                                        {categories.map((cat) => {
                                            const Icon       = cat.icon;
                                            const isSelected = categoryId === cat.id;
                                            return (
                                                <motion.button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategoryId(cat.id)}
                                                    whileTap={{ scale: 0.88 }}
                                                    transition={SPRING.snap}
                                                    className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tap-highlight overflow-hidden"
                                                    style={{ borderRadius: R.inner }}
                                                >
                                                    {isSelected ? (
                                                        <motion.div
                                                            layoutId="cat-bg"
                                                            className="absolute inset-0"
                                                            style={{
                                                                borderRadius: R.inner,
                                                                background:   `color-mix(in srgb, ${cat.color} 13%, white)`,
                                                                border:       `1.5px solid color-mix(in srgb, ${cat.color} 36%, transparent)`,
                                                            }}
                                                            transition={SPRING.base}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                borderRadius: R.inner,
                                                                background:   C.bg,
                                                                border:       `1px solid ${C.border}`,
                                                            }}
                                                        />
                                                    )}
                                                    <span className="relative z-10">
                                                        <Icon size={18} style={{ color: isSelected ? cat.color : "rgba(28,20,16,0.35)" }} aria-hidden />
                                                    </span>
                                                    <span className="relative z-10" style={{ color: isSelected ? cat.color : C.muted }}>
                                                        {cat.name}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            {/* メモ入力 */}
                            <motion.div className="px-4 mb-3" variants={DRAWER_ANIM.item}>
                                <input
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    className="flex h-10 w-full px-3 outline-none transition-colors"
                                    style={{
                                        fontSize:     '16px', // iOS Safari ズーム抑制（16px 未満でズーム発生）
                                        border:       `1.5px solid ${noteText ? C.brand : C.border}`,
                                        borderRadius: R.input,
                                        background:   noteText ? C.brandLight : C.bg,
                                        color:        C.text,
                                    }}
                                    placeholder="メモ（店名・用途など、任意）"
                                />
                            </motion.div>

                            {/* テンキー */}
                            <motion.div className="px-4 mb-3" variants={DRAWER_ANIM.item}>
                                <Numpad onKey={handleNumKey} />
                            </motion.div>

                            {/* 確定ボタン */}
                            <motion.div className="px-4 pb-10" variants={DRAWER_ANIM.item}>
                                <AnimatePresence mode="wait">
                                    {submitted ? (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0.85, opacity: 0 }}
                                            animate={{ scale: 1,    opacity: 1 }}
                                            exit={{ scale: 0.90, opacity: 0 }}
                                            transition={SPRING.quick}
                                            className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-white"
                                            style={{
                                                background:   `linear-gradient(135deg, ${C.income}, ${C.incomeDeep})`,
                                                borderRadius: R.input,
                                            }}
                                        >
                                            <Check size={18} strokeWidth={2.5} />
                                            記録しました！
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key="submit"
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={amountStr === "" || amountStr === "0"}
                                            whileTap={{ scale: 0.97 }}
                                            transition={SPRING.snap}
                                            className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-white tap-highlight disabled:opacity-40"
                                            style={{
                                                background: amountStr && Number(amountStr) > 0
                                                    ? (balanceType === 0
                                                        ? `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`
                                                        : `linear-gradient(135deg, ${C.income}, ${C.incomeDeep})`)
                                                    : "rgba(28,20,16,0.14)",
                                                borderRadius: R.input,
                                                boxShadow: amountStr && Number(amountStr) > 0
                                                    ? (balanceType === 0
                                                        ? "0 4px 16px rgba(241,136,64,0.28)"
                                                        : "0 4px 16px rgba(53,181,162,0.24)")
                                                    : "none",
                                                transition: "background 0.2s, box-shadow 0.2s",
                                            }}
                                        >
                                            <Receipt size={16} />
                                            記録する
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}
