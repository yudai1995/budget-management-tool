"use client";

import { X } from "lucide-react";

interface Props {
    onSave: (totalAssets: number, monthlyIncome: number) => void;
    /** 前回保存済みの値（再設定時に初期セット） */
    defaultAssets?: number;
    defaultIncome?: number;
    /** 設定済み状態から開いた場合に表示する閉じるボタン */
    onClose?: () => void;
}

/** 資産・月次収入を入力するセットアップモーダル */
export function SetupModal({ onSave, defaultAssets, defaultIncome, onClose }: Props) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const assets = Number(fd.get("totalAssets"));
        const income = Number(fd.get("monthlyIncome") ?? 0);
        if (assets < 0 || Number.isNaN(assets)) return;
        onSave(assets, income);
    }

    const isReconfigure = defaultAssets !== undefined;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            { }
            <div
                className="relative mx-4 w-full max-w-md rounded-[var(--radius-card)] border border-orange-200 bg-[var(--color-surface-subtle)] p-8 shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                {/* 閉じるボタン（再設定時のみ表示） */}
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="閉じる"
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-orange-100 hover:text-zinc-600"
                    >
                        <X size={16} />
                    </button>
                )}

                <p className="mb-1 text-xs font-medium text-zinc-400">
                    {isReconfigure ? "家計の寿命 — 設定の更新" : "家計の寿命 — はじめに"}
                </p>
                <h1 className="mb-2 text-xl font-bold text-zinc-800">
                    {isReconfigure ? "資産データを更新する" : "あなたの家計の寿命を計算します"}
                </h1>
                {!isReconfigure && (
                    <p className="mb-6 text-sm text-zinc-500">
                        現在の資産と収入を入力すると、今のペースで
                        <span className="font-medium text-[var(--color-brand-primary)]">
                            あと何年・何ヶ月 自由に暮らせるか
                        </span>
                        がわかります。
                    </p>
                )}

                <form onSubmit={handleSubmit} className={isReconfigure ? "mt-4 flex flex-col gap-5" : "flex flex-col gap-5"}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700" htmlFor="totalAssets">
                            現在の総資産（円）
                        </label>
                        <input
                            id="totalAssets"
                            name="totalAssets"
                            type="number"
                            required
                            min={0}
                            defaultValue={defaultAssets}
                            placeholder="5,000,000"
                            className="rounded-[var(--radius-md)] border border-orange-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-300 focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-orange-100"
                        />
                        <p className="text-xs text-zinc-400">
                            貯金・投資・現金の合計額を入力してください。
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700" htmlFor="monthlyIncome">
                            月次の固定収入（円）— 任意
                        </label>
                        <input
                            id="monthlyIncome"
                            name="monthlyIncome"
                            type="number"
                            min={0}
                            defaultValue={defaultIncome ?? 0}
                            placeholder="0"
                            className="rounded-[var(--radius-md)] border border-orange-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-300 focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-orange-100"
                        />
                        <p className="text-xs text-zinc-400">
                            確定している収入のみ入力してください。不明な場合は 0 のままで構いません。
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-secondary)] active:opacity-80"
                    >
                        {isReconfigure ? "更新する →" : "家計の寿命を計算する →"}
                    </button>
                </form>
            </div>
        </div>
    );
}
