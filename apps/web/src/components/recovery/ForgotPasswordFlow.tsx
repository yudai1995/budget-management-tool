"use client";

import { useActionState, useState } from "react";
import {
    lookupRecoveryAction,
    verifyRecoveryAction,
    resetPasswordAction,
} from "@/lib/actions/recovery";
import type { LookupState, VerifyState, ResetPasswordState } from "@/lib/actions/recovery";
import { PasswordStrengthMeter } from "@/components/common/PasswordStrengthMeter";
import Link from "next/link";

type Step = "lookup" | "verify" | "reset";

// ─── ステップ1: ユーザー名入力 ─────────────────────────────────────

function LookupStep({ onNext }: { onNext: (userId: string, questionText: string) => void }) {
    const [state, formAction, isPending] = useActionState<LookupState, FormData>(
        async (prev, formData) => {
            const result = await lookupRecoveryAction(prev, formData);
            if (result.question && result.userId) {
                onNext(result.userId, result.question.questionText);
            }
            return result;
        },
        { error: null },
    );

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                登録時に設定したユーザー名を入力してください。秘密の質問でパスワードを再設定できます。
            </p>
            <div className="flex flex-col gap-1">
                <label htmlFor="userId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    ユーザー名
                </label>
                <input
                    id="userId"
                    name="userId"
                    type="text"
                    autoComplete="username"
                    placeholder="ユーザー名を入力"
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                />
            </div>
            {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {state.error}
                </p>
            )}
            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
                {isPending ? "確認中..." : "次へ"}
            </button>
        </form>
    );
}

// ─── ステップ2: 秘密の質問回答 ─────────────────────────────────────

function VerifyStep({
    userId,
    questionText,
    onNext,
}: {
    userId: string;
    questionText: string;
    onNext: (resetToken: string) => void;
}) {
    const [state, formAction, isPending] = useActionState<VerifyState, FormData>(
        async (prev, formData) => {
            const result = await verifyRecoveryAction(prev, formData);
            if (result.resetToken) {
                onNext(result.resetToken);
            }
            return result;
        },
        { error: null },
    );

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="userId" value={userId} />

            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-700/50 px-4 py-3">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">秘密の質問</p>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{questionText}</p>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="answer" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    回答
                </label>
                <input
                    id="answer"
                    name="answer"
                    type="text"
                    autoComplete="off"
                    placeholder="回答を入力（大文字・小文字は区別されません）"
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                />
            </div>

            {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
                {isPending ? "照合中..." : "回答を確認する"}
            </button>
        </form>
    );
}

// ─── ステップ3: 新パスワード設定 ──────────────────────────────────

function ResetStep({ resetToken }: { resetToken: string }) {
    const [newPassword, setNewPassword] = useState("");
    const [state, formAction, isPending] = useActionState<ResetPasswordState, FormData>(
        resetPasswordAction,
        { error: null },
    );

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="resetToken" value={resetToken} />

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                新しいパスワードを設定してください。
            </p>

            <div className="flex flex-col gap-1">
                <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    新しいパスワード
                </label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="8文字以上"
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                />
                <PasswordStrengthMeter password={newPassword} />
            </div>

            {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
                {isPending ? "設定中..." : "パスワードを設定する"}
            </button>
        </form>
    );
}

// ─── メインコンポーネント ─────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
    lookup: "① ユーザー名を入力",
    verify: "② 秘密の質問に回答",
    reset: "③ 新しいパスワードを設定",
};

export function ForgotPasswordFlow() {
    const [step, setStep] = useState<Step>("lookup");
    const [userId, setUserId] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [resetToken, setResetToken] = useState("");

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <section className="w-full max-w-sm rounded-xl bg-white p-8 shadow dark:bg-zinc-800">
                <h1 className="mb-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    パスワードを忘れた場合
                </h1>
                <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-400">
                    {STEP_LABELS[step]}
                </p>

                {/* ステップインジケーター */}
                <div className="flex gap-2 mb-6">
                    {(["lookup", "verify", "reset"] as Step[]).map((s, i) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full ${
                                step === s
                                    ? "bg-zinc-800 dark:bg-zinc-200"
                                    : i < (["lookup", "verify", "reset"] as Step[]).indexOf(step)
                                    ? "bg-zinc-400"
                                    : "bg-zinc-200 dark:bg-zinc-700"
                            }`}
                        />
                    ))}
                </div>

                {step === "lookup" && (
                    <LookupStep
                        onNext={(uid, qText) => {
                            setUserId(uid);
                            setQuestionText(qText);
                            setStep("verify");
                        }}
                    />
                )}
                {step === "verify" && (
                    <VerifyStep
                        userId={userId}
                        questionText={questionText}
                        onNext={(token) => {
                            setResetToken(token);
                            setStep("reset");
                        }}
                    />
                )}
                {step === "reset" && <ResetStep resetToken={resetToken} />}

                <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700 text-center">
                    <Link href="/login" className="text-sm text-zinc-500 dark:text-zinc-400 underline underline-offset-2">
                        ログイン画面に戻る
                    </Link>
                </div>
            </section>
        </div>
    );
}
