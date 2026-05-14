/**
 * AssetOutlookABPrototype — 長期指標 表示パターン比較
 *
 * Pattern A: 資産ランウェイ（「家計の寿命」現行）
 * Pattern B: 今月の貯蓄額（先月比付き）
 * Pattern C: 年間貯蓄ペース予測
 * Pattern D: 財政健全スコア（複合指標）
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ChevronLeft, TrendingUp, TrendingDown,
    Shield, AlertTriangle,
    Target,
} from "lucide-react";

const R = { card: "12px", inner: "8px", badge: "9999px" } as const;
const C = {
    bg: "#fffdf5", card: "#ffffff", text: "#1c1410",
    muted: "rgba(28,20,16,0.45)", border: "#e8c8b0",
    shadow: "0 1px 4px 0 rgba(28,20,16,0.07), 0 0 0 1px rgba(28,20,16,0.06)",
    brand: "#f18840", brandLight: "#fff6ee",
    income: "#35b5a2", incomeLight: "#ecfaf8",
    expense: "#f18840",
    danger: "#f43f5e", dangerLight: "#fff1f2",
    caution: "#f59e0b",
} as const;

// ─── モックデータ ────────────────────────────────────────────────────────────

const MOCK = {
    totalAssets: 999853,
    monthlyIncome: 252600,
    avgDailyExpense: 9800,
    // 今月
    thisMonthExpense: 148700,
    thisMonthIncome: 252600,
    // 先月
    lastMonthExpense: 136300,
    lastMonthIncome: 252600,
    // 計算値
    netDailyExpense: 9800 - 252600 / 30, // 1,380円/日
    // 記録日数
    recordedMonths: 4,
};

const thisMonthSavings = MOCK.thisMonthIncome - MOCK.thisMonthExpense;       // 103,900
const lastMonthSavings = MOCK.lastMonthIncome - MOCK.lastMonthExpense;       // 116,300
const savingsDiff = thisMonthSavings - lastMonthSavings;                     // -12,400
const annualSavingsPace = thisMonthSavings * 12;                             // 1,246,800
const savingsRate = Math.round((thisMonthSavings / MOCK.thisMonthIncome) * 100); // 41%
const assetRunwayDays = Math.floor(MOCK.totalAssets / MOCK.netDailyExpense); // 724日
const assetRunwayDate = (() => {
    const d = new Date(2026, 4, 15); // 現在日（モック）
    d.setDate(d.getDate() + assetRunwayDays);
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
})(); // "2028年5月"

function yen(n: number) { return `¥${Math.round(n).toLocaleString("ja-JP")}`; }

// ─── 共通コンポーネント ───────────────────────────────────────────────────

function Meta({ pros, cons, data, warning }: {
    pros: string[]; cons: string[]; data: string[]; warning?: string;
}) {
    return (
        <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: C.border }}>
            {warning && (
                <div
                    className="flex items-start gap-2 rounded-lg px-3 py-2 text-[11px]"
                    style={{ background: "#fff8f0", border: `1px solid ${C.brand}40`, color: C.text + "cc" }}
                >
                    <AlertTriangle size={11} style={{ color: C.brand, flexShrink: 0, marginTop: 1 }} />
                    {warning}
                </div>
            )}
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

// ─── Pattern A: 資産ランウェイ（現行「家計の寿命」）──────────────────────

function PatternA() {
    return (
        <div>
            <PatternLabel label="A" name="資産ランウェイ" />
            <div
                className="flex flex-col items-center justify-center py-6 text-center"
                style={{ borderRadius: R.inner, background: C.incomeLight }}
            >
                <div className="mb-1 text-[11px] font-semibold" style={{ color: C.muted }}>
                    今のペースで資産が尽きる時期
                </div>
                <motion.div
                    className="text-3xl font-extrabold"
                    style={{ color: C.income }}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    {assetRunwayDate}
                </motion.div>
                <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                    残り約 {Math.round(assetRunwayDays / 30)} ヶ月
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                    { label: "総資産", value: yen(MOCK.totalAssets) },
                    { label: "純日次支出", value: yen(Math.round(MOCK.netDailyExpense)) },
                ].map((item) => (
                    <div key={item.label} className="px-3 py-2.5" style={{ background: C.bg, borderRadius: R.inner }}>
                        <div className="text-[9px] font-bold mb-1" style={{ color: C.muted }}>{item.label}</div>
                        <div className="font-mono text-[13px] font-extrabold tabular-nums" style={{ color: C.text }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <Meta
                data={[
                    "今の純支出ペースが続いた場合の資産枯渇時期",
                    "総資産 ÷ (平均日次支出 − 月収÷30) で算出",
                    "資産が「減っているか」の長期サイン",
                ]}
                pros={["長期的な危機感を持てる", "資産と支出の関係が可視化される"]}
                cons={["定収入がある人は ∞ になりやすく機能しない", "「尽きる」という表現がネガティブ", "月収が変動すると大きくブレる"]}
                warning="定収入がある人は純日次支出がほぼ0になり「∞」表示になりやすい。その場合この指標は無意味。"
            />
        </div>
    );
}

// ─── Pattern B: 今月の貯蓄額（先月比付き）───────────────────────────────

function PatternB() {
    const isPositive = savingsDiff >= 0;
    return (
        <div>
            <PatternLabel label="B" name="今月の貯蓄額" />

            <div
                className="flex flex-col items-center justify-center py-6 text-center"
                style={{ borderRadius: R.inner, background: C.incomeLight }}
            >
                <div className="mb-1 text-[11px] font-semibold" style={{ color: C.muted }}>今月の貯蓄</div>
                <motion.div
                    className="text-3xl font-extrabold tabular-nums"
                    style={{ color: C.income }}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    {yen(thisMonthSavings)}
                </motion.div>
                <div
                    className="mt-2 flex items-center gap-1 text-[12px] font-semibold"
                    style={{ color: isPositive ? C.income : C.danger }}
                >
                    {isPositive
                        ? <TrendingUp size={13} />
                        : <TrendingDown size={13} />
                    }
                    先月比 {isPositive ? "+" : "−"}¥{Math.abs(savingsDiff).toLocaleString("ja-JP")}
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                    { label: "収入", value: yen(MOCK.thisMonthIncome), color: C.income },
                    { label: "支出", value: yen(MOCK.thisMonthExpense), color: C.expense },
                    { label: "貯蓄率", value: `${savingsRate}%`, color: savingsRate >= 20 ? C.income : C.caution },
                    { label: "先月の貯蓄", value: yen(lastMonthSavings), color: C.muted },
                ].map((item) => (
                    <div key={item.label} className="px-3 py-2.5" style={{ background: C.bg, borderRadius: R.inner }}>
                        <div className="text-[9px] font-bold mb-1" style={{ color: C.muted }}>{item.label}</div>
                        <div className="font-mono text-[13px] font-extrabold tabular-nums" style={{ color: item.color }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <Meta
                data={[
                    "今月の貯蓄額（収入 − 支出）",
                    "先月比の貯蓄差額",
                    "貯蓄率（手取りの何%を貯めているか）",
                ]}
                pros={["誰にでも直感的に理解できる", "毎月更新される達成感がある", "定収入の人にも有意義"]}
                cons={["月中だと確定値ではなく予測", "長期的な視点がない", "先月データが必要"]}
            />
        </div>
    );
}

// ─── Pattern C: 年間貯蓄ペース予測 ─────────────────────────────────────

function PatternC() {
    const annualTarget = 1500000; // 仮の目標額
    const progressPct = Math.min(100, Math.round((annualSavingsPace / annualTarget) * 100));
    return (
        <div>
            <PatternLabel label="C" name="年間貯蓄ペース予測" />

            <div
                className="flex flex-col items-center justify-center py-6 text-center"
                style={{ borderRadius: R.inner, background: C.incomeLight }}
            >
                <div className="mb-1 text-[11px] font-semibold" style={{ color: C.muted }}>
                    このペースで年間
                </div>
                <motion.div
                    className="text-3xl font-extrabold tabular-nums"
                    style={{ color: C.income }}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    {yen(annualSavingsPace)}
                </motion.div>
                <div className="mt-1 text-[11px]" style={{ color: C.muted }}>貯蓄できます</div>
            </div>

            {/* 目標との比較バー */}
            <div className="mt-3 p-3" style={{ background: C.bg, borderRadius: R.inner }}>
                <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold" style={{ color: C.text }}>年間目標 {yen(annualTarget)}</span>
                    <span className="font-bold tabular-nums" style={{ color: progressPct >= 100 ? C.income : C.brand }}>
                        {progressPct}%
                    </span>
                </div>
                <div className="h-2 overflow-hidden" style={{ background: "rgba(28,20,16,0.08)", borderRadius: R.badge }}>
                    <motion.div
                        className="h-full"
                        style={{ background: progressPct >= 100 ? C.income : C.brand, borderRadius: R.badge }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>
                <div className="mt-1.5 text-[10px]" style={{ color: C.muted }}>
                    ※ 今月の貯蓄額 × 12 で算出（{MOCK.recordedMonths}ヶ月分の実績あり）
                </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                    { label: "今月の貯蓄", value: yen(thisMonthSavings) },
                    { label: "貯蓄率", value: `${savingsRate}%` },
                    { label: "目標達成率", value: `${progressPct}%` },
                ].map((item) => (
                    <div key={item.label} className="px-2 py-2 text-center" style={{ background: C.bg, borderRadius: R.inner }}>
                        <div className="text-[9px] font-bold mb-1" style={{ color: C.muted }}>{item.label}</div>
                        <div className="font-mono text-[12px] font-extrabold tabular-nums" style={{ color: C.text }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <Meta
                data={[
                    "今月のペースで年換算した貯蓄額",
                    "年間目標との達成率（目標設定時）",
                    "貯蓄率（手取りに対する比率）",
                ]}
                pros={["前向きな目標感が生まれる", "「年間○○万貯める」という計画に使える"]}
                cons={["今月1ヶ月のデータで年換算するのは精度が低い", "目標設定が必要（オンボーディング負荷）", "ボーナス月などで大きくブレる"]}
                warning="今月の貯蓄が少ない月（大きな出費がある月など）に見ると不安になりやすい。直近3〜6ヶ月平均の方が安定する。"
            />
        </div>
    );
}

// ─── Pattern D: 財政健全スコア ────────────────────────────────────────

type ScoreTone = "good" | "ok" | "bad";

function scoreTone(score: number): ScoreTone {
    if (score >= 70) return "good";
    if (score >= 40) return "ok";
    return "bad";
}
function toneColor(t: ScoreTone) {
    return t === "good" ? C.income : t === "ok" ? C.caution : C.danger;
}
function toneLabel(t: ScoreTone) {
    return t === "good" ? "良好" : t === "ok" ? "普通" : "要注意";
}

const SCORE_FACTORS = [
    {
        label: "予算遵守率",
        desc: "1日予算に対してどれだけ守れているか",
        score: 72,
        weight: 30,
        note: "過去7日で5日が予算内",
    },
    {
        label: "貯蓄率",
        desc: "月収に対する貯蓄額の割合",
        score: 82,
        weight: 40,
        note: `今月 ${savingsRate}% (目安: 20%以上)`,
    },
    {
        label: "支出トレンド",
        desc: "先月比の支出増減",
        score: 55,
        weight: 30,
        note: "食費 +23%、医療費 +173% が押し下げ",
    },
];
const TOTAL_SCORE = Math.round(
    SCORE_FACTORS.reduce((s, f) => s + (f.score * f.weight) / 100, 0)
);

function PatternD() {
    const tone = scoreTone(TOTAL_SCORE);
    const color = toneColor(tone);
    const ToneIcon = tone === "good" ? Shield : tone === "ok" ? Target : AlertTriangle;

    return (
        <div>
            <PatternLabel label="D" name="財政健全スコア" />

            <div
                className="flex flex-col items-center justify-center py-6 text-center"
                style={{ borderRadius: R.inner, background: `color-mix(in srgb, ${color} 8%, white)` }}
            >
                <ToneIcon size={28} style={{ color }} />
                <div className="mt-2 text-[11px] font-semibold" style={{ color: C.muted }}>財政健全スコア</div>
                <motion.div
                    className="text-4xl font-extrabold tabular-nums"
                    style={{ color }}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    {TOTAL_SCORE}
                    <span className="text-lg font-semibold" style={{ color: C.muted }}> / 100</span>
                </motion.div>
                <div
                    className="mt-1 px-3 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: color, borderRadius: R.badge }}
                >
                    {toneLabel(tone)}
                </div>
            </div>

            {/* スコア内訳 */}
            <div className="mt-3 space-y-2">
                {SCORE_FACTORS.map((f) => {
                    const t = scoreTone(f.score);
                    return (
                        <div key={f.label} className="p-3" style={{ background: C.bg, borderRadius: R.inner }}>
                            <div className="mb-1 flex items-center justify-between">
                                <div>
                                    <span className="text-[12px] font-semibold" style={{ color: C.text }}>{f.label}</span>
                                    <span className="ml-1.5 text-[9px]" style={{ color: C.muted }}>（重み {f.weight}%）</span>
                                </div>
                                <span className="font-mono text-[13px] font-extrabold" style={{ color: toneColor(t) }}>
                                    {f.score}
                                </span>
                            </div>
                            <div className="mb-1 h-1.5 overflow-hidden" style={{ background: "rgba(28,20,16,0.08)", borderRadius: R.badge }}>
                                <motion.div
                                    className="h-full"
                                    style={{ background: toneColor(t), borderRadius: R.badge }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${f.score}%` }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </div>
                            <div className="text-[10px]" style={{ color: C.muted }}>{f.note}</div>
                        </div>
                    );
                })}
            </div>

            <Meta
                data={[
                    "複数の財政指標を統合した総合スコア（0〜100）",
                    "内訳: 予算遵守率・貯蓄率・支出トレンドの加重平均",
                    "各指標の個別スコアと改善ポイント",
                ]}
                pros={["単一の数値でわかりやすい", "改善すべき要因が内訳で確認できる", "ゲーム感覚でモチベーション維持"]}
                cons={["スコアの根拠が不透明に感じられる", "重みの設定が恣意的で説明責任が難しい", "実装コストが高く、指標の調整が必要"]}
                warning="スコアの算出ロジックを開示しないとブラックボックス感が強い。「なぜ55点なのか」を説明できる設計が必要。"
            />
        </div>
    );
}

// ─── メインページ ────────────────────────────────────────────────────────

export function AssetOutlookABPrototype() {
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
                    長期指標 — A/B 比較
                </span>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
                <div
                    className="mb-5 rounded-lg border px-4 py-3 text-xs"
                    style={{ borderColor: C.border, background: C.card, color: C.muted }}
                >
                    「長期的な財政の状況」をどう伝えるか、4パターンを比較します。
                    同じ財務データ（総資産・月収支・貯蓄率）を異なる切り口で表現しています。
                    <br />
                    <span className="mt-1 block font-semibold" style={{ color: C.text }}>
                        モック値: 総資産 ¥999,853 / 月収 ¥252,600 / 今月支出 ¥148,700 / 貯蓄 ¥103,900
                    </span>
                </div>

                {/* 4パターン 2×2 グリッド */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[PatternA, PatternB, PatternC, PatternD].map((Pattern, i) => (
                        <div
                            key={i}
                            className="border p-5"
                            style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                        >
                            <Pattern />
                        </div>
                    ))}
                </div>

                {/* 比較サマリー */}
                <div
                    className="mt-6 border p-4"
                    style={{ borderRadius: R.card, background: C.card, borderColor: C.border, boxShadow: C.shadow }}
                >
                    <div className="mb-3 text-sm font-extrabold" style={{ color: C.text }}>
                        パターン比較サマリー
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    {["", "A: ランウェイ", "B: 貯蓄額", "C: 年間ペース", "D: スコア"].map((h) => (
                                        <th key={h} className="py-2 pr-3 text-left font-bold" style={{ color: C.muted }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    {
                                        label: "対象ユーザー",
                                        vals: ["資産取り崩し中の人", "定収入で貯蓄したい人", "年間目標がある人", "総合管理したい人"],
                                    },
                                    {
                                        label: "必要データ",
                                        vals: ["総資産・平均支出", "月収支のみ", "月収支・目標", "複数指標"],
                                    },
                                    {
                                        label: "更新頻度",
                                        vals: ["リアルタイム", "月次", "月次", "月次"],
                                    },
                                    {
                                        label: "直感的さ",
                                        vals: ["△（抽象的）", "◎（誰でも）", "○", "○（スコアは直感）"],
                                    },
                                    {
                                        label: "実装コスト",
                                        vals: ["中", "低", "低〜中", "高"],
                                    },
                                ].map((row) => (
                                    <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td className="py-2 pr-3 font-semibold" style={{ color: C.muted }}>{row.label}</td>
                                        {row.vals.map((v, i) => (
                                            <td key={i} className="py-2 pr-3" style={{ color: C.text }}>{v}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ナビ */}
                <div className="mt-6 flex items-center justify-between text-xs" style={{ color: C.muted }}>
                    <Link to="/category-ab" style={{ color: C.brand }} className="font-semibold hover:underline">
                        ← カテゴリ TOP A/B
                    </Link>
                    <Link to="/home-v4" style={{ color: C.brand }} className="font-semibold hover:underline">
                        V4 ダッシュボードへ →
                    </Link>
                </div>
            </div>
        </div>
    );
}
