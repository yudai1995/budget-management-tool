"use client";

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import {
    calcRealtimeAssets,
    calcExpenseImpact,
    calculateXDay,
    DEFAULT_STATS_DAILY_EXPENSE,
} from "@budget/common";
import { SetupModal } from "./SetupModal";

const STORAGE_KEY_ASSETS = "hkl_total_assets";
const STORAGE_KEY_INCOME = "hkl_monthly_income";

/**
 * localStorage を外部ストアとして扱う useSyncExternalStore ヘルパー。
 * - サーバースナップショット = null（SSR 時は常に未設定扱い）
 * - クライアントスナップショット = localStorage の現在値
 * これにより hydration 時はサーバーと一致し、マウント後に localStorage 値へ遷移する。
 */
function subscribeStorage(callback: () => void): () => void {
    // storage イベント（他タブ書き込み）にも対応
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}
function readAssetsSnapshot(): number | null {
    const v = localStorage.getItem(STORAGE_KEY_ASSETS);
    return v !== null ? Number(v) : null;
}
function readIncomeSnapshot(): number {
    const v = localStorage.getItem(STORAGE_KEY_INCOME);
    return v ? Number(v) : 0;
}
const SERVER_ASSETS: number | null = null;
const SERVER_INCOME: number = 0;

interface Props {
    /** 本日の支出合計 */
    todayExpense: number;
    /** 昨日の支出合計 */
    yesterdayExpense: number;
    /** 完封継続日数（支出ゼロの連続日数） */
    zeroStreakDays: number;
    /** 直近30日の日次平均支出B（Server側で算出） */
    avgDailyExpense: number;
    /** 記録済み日数n（Server側で算出） */
    recordedDays: number;
}

/** 残存日数を「◯年◯ヶ月」形式に変換 */
function formatLifespan(daysRemaining: number | null): { main: string; sub: string } {
    if (daysRemaining === null) return { main: "∞", sub: "収入が支出をカバーしています" };
    if (daysRemaining <= 0) return { main: "0日", sub: "資産の状況を確認しましょう" };

    const years = Math.floor(daysRemaining / 365);
    const months = Math.floor((daysRemaining % 365) / 30);
    const days = daysRemaining % 30;

    if (years >= 10) {
        return { main: `${years}年`, sub: `余裕のある家計を維持しています` };
    }
    if (years >= 1) {
        return {
            main: `${years}年 ${months}ヶ月`,
            sub: `${Math.floor(daysRemaining).toLocaleString()} 日分の余裕があります`,
        };
    }
    if (months >= 1) {
        return { main: `${months}ヶ月 ${days}日`, sub: "支出を少し抑えると期間が延びます" };
    }
    return { main: `${daysRemaining}日`, sub: "家計を整えるタイミングです" };
}

/** 残存日数からステータスを判定 */
function getLifespanStatus(daysRemaining: number | null): "infinite" | "long" | "medium" | "short" {
    if (daysRemaining === null) return "infinite";
    if (daysRemaining > 365 * 10) return "long";
    if (daysRemaining > 365 * 2) return "medium";
    return "short";
}

/** ステータスに対応するオレンジグラデーション色 */
const STATUS_COLORS = {
    infinite: "var(--color-income)",       // teal（∞ = 最良）
    long:     "var(--color-income)",       // teal（10年超）
    medium:   "var(--color-brand-primary)", // オレンジ（2〜10年）
    short:    "var(--color-brand-secondary)", // 濃いオレンジ（2年未満）
} as const;

/** 信頼度インジケーターのバー幅（%） */
function TrustBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color = value >= 0.7
        ? "var(--color-income)"
        : value >= 0.3
        ? "var(--color-brand-primary)"
        : "var(--color-brand-secondary)";
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs text-zinc-500 tabular-nums">{pct}%</span>
        </div>
    );
}

export function XDayDisplay({
    todayExpense,
    yesterdayExpense,
    zeroStreakDays,
    avgDailyExpense,
    recordedDays,
}: Props) {
    // useSyncExternalStore: サーバー = null、クライアントマウント後 = localStorage 値
    // → hydration 時は必ずサーバーと一致する
    const totalAssets = useSyncExternalStore(subscribeStorage, readAssetsSnapshot, () => SERVER_ASSETS);
    const monthlyIncome = useSyncExternalStore(subscribeStorage, readIncomeSnapshot, () => SERVER_INCOME);

    // リアルタイム更新値（setInterval で更新。静止時は null のまま → 後述の導出値を使う）
    const [rtAssets, setRtAssets] = useState<number | null>(null);
    const [rtDays, setRtDays] = useState<number | null>(null);
    const [snapshotAt] = useMemo(() => [new Date()], []);

    // 再設定モーダルの表示フラグ（localStorageは消さず、モーダルを重ねて表示）
    const [showSetup, setShowSetup] = useState(false);

    /** localStorage に書き込み、storage イベントを dispatch して useSyncExternalStore を更新 */
    const handleSetup = useCallback((assets: number, income: number) => {
        localStorage.setItem(STORAGE_KEY_ASSETS, String(assets));
        localStorage.setItem(STORAGE_KEY_INCOME, String(income));
        // storage イベントは同一タブでは発火しないため手動 dispatch
        window.dispatchEvent(new Event("storage"));
        setShowSetup(false);
    }, []);

    // Xデーをクライアント側で算出
    const xdayResult = totalAssets !== null
        ? calculateXDay({
              totalAssets,
              avgDailyExpense,
              monthlyIncome,
              statsDailyExpense: DEFAULT_STATS_DAILY_EXPENSE,
              recordedDays,
              lastUpdatedAt: snapshotAt,
          })
        : null;

    const netDailyExpense = xdayResult?.netDailyExpense ?? 0;
    const minutesPerYen = xdayResult?.minutesPerYen ?? 0;
    const trustWeight = xdayResult?.trustWeight ?? 0;

    // 静止状態（収入>支出、または資産未設定）では静的導出値を使う
    const realtimeAssets = netDailyExpense > 0 ? rtAssets : totalAssets;
    const daysRemaining = netDailyExpense > 0 ? rtDays : (xdayResult?.daysRemaining ?? null);

    // 1秒ごとにリアルタイム資産を更新（侵食がある場合のみ）
    useEffect(() => {
        if (totalAssets === null || netDailyExpense <= 0) return;

        const tick = () => {
            const now = new Date();
            const rt = calcRealtimeAssets(totalAssets, netDailyExpense, snapshotAt, now);
            setRtAssets(rt);
            setRtDays(Math.floor(rt / netDailyExpense));
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [totalAssets, netDailyExpense, snapshotAt]);

    // 初回（未設定）の場合はセットアップモーダルを表示
    if (totalAssets === null) {
        return <SetupModal onSave={handleSetup} />;
    }

    // 再設定モーダル（既存値を初期セット、×ボタンで閉じられる）
    if (showSetup) {
        return (
            <SetupModal
                onSave={handleSetup}
                defaultAssets={totalAssets}
                defaultIncome={monthlyIncome}
                onClose={() => setShowSetup(false)}
            />
        );
    }

    const status = getLifespanStatus(daysRemaining);
    const statusColor = STATUS_COLORS[status];
    const lifespan = formatLifespan(daysRemaining);

    const impactLabel = todayExpense > 0 && minutesPerYen > 0
        ? calcExpenseImpact(todayExpense, minutesPerYen).label
        : null;

    return (
        <section className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
            {/* タイトル（他ウィジットと統一） */}
            <h2 className="mb-4 text-center text-sm font-semibold text-zinc-700">家計の寿命</h2>

            {/* メイン：残り期間 */}
            <div className="mb-3 rounded-lg border border-zinc-100 p-3 text-center">
                <p
                    className="text-2xl font-bold tabular-nums leading-tight transition-colors duration-1000"
                    style={{ color: statusColor }}
                >
                    あと {lifespan.main}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{lifespan.sub}</p>
            </div>

            {/* 資産情報グリッド */}
            <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-500">残存資産</p>
                    <p className="mt-1 text-base font-semibold tabular-nums text-zinc-800">
                        {realtimeAssets !== null
                            ? `¥ ${Math.floor(realtimeAssets).toLocaleString("ja-JP")}`
                            : "---"}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-500">1日あたりの支出</p>
                    <p className="mt-1 text-base font-semibold tabular-nums text-zinc-800">
                        ¥{Math.round(netDailyExpense).toLocaleString()}
                        <span className="ml-1 text-xs font-normal text-zinc-400">/ 日</span>
                    </p>
                    {minutesPerYen > 0 && (
                        <p className="mt-0.5 text-xs text-zinc-400">
                            1,000円 ={" "}
                            {minutesPerYen >= 1
                                ? `${(minutesPerYen * 1000 / 60).toFixed(1)}時間`
                                : `${Math.round(minutesPerYen * 1000)}秒`}
                            分
                        </p>
                    )}
                </div>
            </div>

            {/* 今日・昨日 */}
            <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-500">今日</p>
                    <p
                        className="mt-1 text-base font-semibold tabular-nums"
                        style={{ color: todayExpense === 0 ? "var(--color-income)" : "var(--color-expense)" }}
                    >
                        {todayExpense === 0 ? "¥0" : `¥${todayExpense.toLocaleString()}`}
                    </p>
                    {impactLabel && (
                        <p className="mt-0.5 text-xs text-zinc-400">影響 -{impactLabel}</p>
                    )}
                </div>
                <div className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs text-zinc-500">昨日</p>
                    <p className="mt-1 text-base font-semibold tabular-nums text-zinc-800">
                        ¥{yesterdayExpense.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* 信頼度バー */}
            <div className="mb-3">
                <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
                    <span>予測の精度</span>
                    <span>{recordedDays}日分の実績</span>
                </div>
                <TrustBar value={trustWeight} />
            </div>

            {/* 積み上げメッセージ */}
            {zeroStreakDays >= 2 && (
                <p
                    className="mb-3 rounded-lg border p-3 text-xs font-medium"
                    style={{
                        color: "var(--color-income)",
                        borderColor: "var(--color-income-light)",
                        backgroundColor: "var(--color-income-light)",
                    }}
                >
                    {zeroStreakDays}日連続で支出ゼロ — 着実に余裕が積み上がっています
                </p>
            )}
            {todayExpense === 0 && zeroStreakDays < 2 && (
                <p
                    className="mb-3 rounded-lg border p-3 text-xs font-medium"
                    style={{
                        color: "var(--color-income)",
                        borderColor: "var(--color-income-light)",
                        backgroundColor: "var(--color-income-light)",
                    }}
                >
                    今日は支出ゼロ — 余裕が1日分増えました
                </p>
            )}

            {/* 設定更新 */}
            <div className="text-right">
                <button
                    type="button"
                    onClick={() => setShowSetup(true)}
                    className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
                >
                    資産データを更新
                </button>
            </div>
        </section>
    );
}
