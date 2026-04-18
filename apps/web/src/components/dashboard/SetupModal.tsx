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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1410]/50"
            onClick={onClose}
        >
            <div
                className="relative mx-4 w-full max-w-md rounded-2xl border-2 border-[#1c1410] bg-[#fffdf5] p-8"
                style={{ boxShadow: "var(--shadow-pop)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* 幾何学デコレーション */}
                <div
                    className="pointer-events-none absolute right-16 top-4 h-6 w-6 rounded-full border border-[#f18840]/20 bg-[#fff6ee]"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute left-6 bottom-6 h-4 w-4 rotate-12 rounded-sm border border-[#35b5a2]/20 bg-[#ecfaf8]"
                    aria-hidden="true"
                />

                {/* 閉じるボタン（再設定時のみ表示） */}
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="閉じる"
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1c1410] bg-white text-[#1c1410] transition-colors hover:bg-[#fff6ee]"
                        style={{ boxShadow: "var(--shadow-pop-sm)" }}
                    >
                        <X size={14} />
                    </button>
                )}

                <p className="mb-1 text-xs font-bold text-[#1c1410]/40 uppercase tracking-wider">
                    {isReconfigure ? "設定の更新" : "はじめに"}
                </p>
                <h1 className="mb-2 text-xl font-extrabold text-[#1c1410]">
                    {isReconfigure ? "資産データを更新する" : "家計の寿命を計算します"}
                </h1>
                {!isReconfigure && (
                    <p className="mb-6 text-sm text-[#1c1410]/60">
                        現在の資産と収入を入力すると、今のペースで
                        <span className="font-bold text-[#f18840]">
                            あと何年・何ヶ月 自由に暮らせるか
                        </span>
                        がわかります。
                    </p>
                )}

                <form onSubmit={handleSubmit} className={isReconfigure ? "mt-4 flex flex-col gap-5" : "flex flex-col gap-5"}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#1c1410]" htmlFor="totalAssets">
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
                            className="input-pop"
                        />
                        <p className="text-xs text-[#1c1410]/40">
                            貯金・投資・現金の合計額を入力してください。
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-[#1c1410]" htmlFor="monthlyIncome">
                            月次の固定収入（円）
                            <span className="ml-1 font-normal text-[#1c1410]/40">— 任意</span>
                        </label>
                        <input
                            id="monthlyIncome"
                            name="monthlyIncome"
                            type="number"
                            min={0}
                            defaultValue={defaultIncome ?? 0}
                            placeholder="0"
                            className="input-pop"
                        />
                        <p className="text-xs text-[#1c1410]/40">
                            確定している収入のみ入力してください。不明な場合は 0 のままで構いません。
                        </p>
                    </div>

                    <button type="submit" className="btn-candy w-full py-3">
                        {isReconfigure ? "更新する" : "家計の寿命を計算する"}
                    </button>
                </form>
            </div>
        </div>
    );
}
