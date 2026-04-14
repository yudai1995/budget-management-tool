"use client";

import { useState, useTransition } from "react";
import { Delete } from "lucide-react";
import { calcExpenseImpact } from "@budget/common";
import { createExpenseAction, type ExpenseActionState } from "@/lib/actions/expense";

type Step = "amount" | "category" | "confirm";

interface Category {
    id: number;
    key: string;
    label: string;
}

const CATEGORIES: Category[] = [
    { id: 1, key: "food",          label: "食費" },
    { id: 2, key: "transport",     label: "交通" },
    { id: 3, key: "utilities",     label: "光熱" },
    { id: 4, key: "entertainment", label: "娯楽" },
    { id: 5, key: "medical",       label: "医療" },
    { id: 6, key: "other",         label: "他" },
];

const today = () => new Date().toISOString().slice(0, 10);

const INITIAL_STATE: ExpenseActionState = { error: null, success: false };

interface Props {
    userId: string;
    minutesPerYen: number;
    onClose: () => void;
}

/** 支出入力モーダル（3ステップ）— 家計の寿命への影響をリアルタイム表示 */
export function ExpenseInputModal({ userId, minutesPerYen, onClose }: Props) {
    const [step, setStep] = useState<Step>("amount");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [isPending, startTransition] = useTransition();

    const numAmount = Number(amount);
    const impact = numAmount > 0 && minutesPerYen > 0
        ? calcExpenseImpact(numAmount, minutesPerYen)
        : null;

    function appendDigit(d: string) {
        if (amount.length >= 9) return;
        setAmount(prev => prev === "" && d === "0" ? "" : prev + d);
    }

    function backspace() {
        setAmount(prev => prev.slice(0, -1));
    }

    function handleConfirm() {
        if (!category || numAmount <= 0) return;
        const fd = new FormData();
        fd.append("userId", userId);
        fd.append("amount", String(numAmount));
        fd.append("balanceType", "0");
        fd.append("categoryId", String(category.id));
        fd.append("date", today());

        startTransition(async () => {
            await createExpenseAction(INITIAL_STATE, fd);
            onClose();
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
            <div
                className="w-full max-w-sm rounded-t-[var(--radius-card)] bg-[var(--color-surface-subtle)] p-6 shadow-xl sm:rounded-[var(--radius-card)]"
            >
                {/* STEP 1: 金額入力 */}
                {step === "amount" && (
                    <>
                        <p className="mb-1 text-xs font-medium text-zinc-400">STEP 1 / 3  —  金額</p>
                        <div className="mb-4 border-b border-orange-100 py-3">
                            <span className="text-4xl font-bold tabular-nums text-zinc-800">
                                ¥ {amount === "" ? "0" : Number(amount).toLocaleString()}
                            </span>
                            {impact && (
                                <p className="mt-1 text-xs" style={{ color: "var(--color-brand-secondary)" }}>
                                    家計への影響: {impact.label}
                                </p>
                            )}
                        </div>

                        {/* テンキー */}
                        <div className="mb-4 grid grid-cols-3 gap-1.5">
                            {["7","8","9","4","5","6","1","2","3","","0","DEL"].map(k => (
                                <button
                                    key={k}
                                    type="button"
                                    disabled={k === ""}
                                    onClick={() => k === "DEL" ? backspace() : appendDigit(k)}
                                    className="rounded-[var(--radius-md)] border border-orange-100 bg-white py-4 text-lg font-bold text-zinc-700 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] disabled:invisible"
                                >
                                    {k === "DEL" ? <Delete size={18} className="mx-auto" /> : k}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-[var(--radius-md)] border border-orange-100 bg-white py-3 text-sm text-zinc-500 hover:border-zinc-300"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                disabled={numAmount <= 0}
                                onClick={() => setStep("category")}
                                className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-secondary)] disabled:opacity-30"
                            >
                                カテゴリへ →
                            </button>
                        </div>
                    </>
                )}

                {/* STEP 2: カテゴリ選択 */}
                {step === "category" && (
                    <>
                        <p className="mb-1 text-xs font-medium text-zinc-400">STEP 2 / 3  —  カテゴリ</p>
                        <p className="mb-4 text-xl font-bold tabular-nums text-zinc-800">
                            ¥ {numAmount.toLocaleString()}
                        </p>

                        <div className="mb-4 grid grid-cols-3 gap-1.5">
                            {CATEGORIES.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => { setCategory(c); setStep("confirm"); }}
                                    className="rounded-[var(--radius-md)] border border-orange-100 bg-white py-4 text-sm font-bold text-zinc-700 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep("amount")}
                            className="w-full rounded-[var(--radius-md)] border border-orange-100 bg-white py-3 text-sm text-zinc-500 hover:border-zinc-300"
                        >
                            ← 金額に戻る
                        </button>
                    </>
                )}

                {/* STEP 3: 確定 */}
                {step === "confirm" && category && (
                    <>
                        <p className="mb-1 text-xs font-medium text-zinc-400">STEP 3 / 3  —  確定</p>

                        <div className="mb-5 rounded-[var(--radius-md)] border border-orange-100 bg-white p-4">
                            <div className="mb-2 flex justify-between text-sm text-zinc-400">
                                <span>{category.label}</span>
                                <span>{today()}</span>
                            </div>
                            <p className="text-3xl font-bold tabular-nums text-zinc-800">
                                ¥ {numAmount.toLocaleString()}
                            </p>
                            {impact && (
                                <p className="mt-3 text-sm" style={{ color: "var(--color-brand-secondary)" }}>
                                    家計への影響: <strong>{impact.label}</strong>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStep("category")}
                                className="flex-1 rounded-[var(--radius-md)] border border-orange-100 bg-white py-3 text-sm text-zinc-500 hover:border-zinc-300"
                            >
                                修正する
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleConfirm}
                                className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-secondary)] disabled:opacity-50"
                            >
                                {isPending ? "記録中..." : "確定"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
