"use client";

import { useActionState, useState, useEffect } from "react";
import { registerAction } from "@/lib/actions/register";
import type { RegisterState } from "@/lib/actions/register";
import { PasswordStrengthMeter } from "@/components/common/PasswordStrengthMeter";
import { UserNameInput } from "@/components/common/UserNameInput";
import { publicFetch } from "@/lib/api/public-client";
import Link from "next/link";

interface SecurityQuestion {
    id: number;
    text: string;
}

function FieldError({ messages }: { messages?: string[] }) {
    if (!messages?.length) return null;
    return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{messages[0]}</p>;
}

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
        registerAction,
        { error: null }
    );

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [questions, setQuestions] = useState<SecurityQuestion[]>([]);

    // 秘密の質問一覧をロード
    useEffect(() => {
        publicFetch<{ questions: SecurityQuestion[] }>("/security-questions")
            .then((res) => setQuestions(res.questions))
            .catch(() => {});
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 py-12">
            <section className="w-full max-w-md rounded-xl bg-white p-8 shadow dark:bg-zinc-800">
                <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    アカウント登録
                </h1>

                {/* セキュリティ宣言 */}
                <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p>🔒 データは暗号化されサーバーに安全に保存されます</p>
                    <p>👤 メールアドレス不要。プライバシーを保護した匿名利用が可能です</p>
                </div>

                <form action={formAction} className="flex flex-col gap-4">
                    {/* ユーザー名（debounce付き重複チェック） */}
                    <UserNameInput
                        value={userId}
                        onChange={setUserId}
                        error={state.fieldErrors?.userId?.[0]}
                        disabled={isPending}
                    />
                    {/* フォームの hidden フィールドとして値を渡す */}
                    <input type="hidden" name="userId" value={userId} />

                    {/* 表示名 */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="displayName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            表示名 <span className="text-zinc-400 font-normal">（省略可・後から変更可）</span>
                        </label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            autoComplete="name"
                            placeholder="ニックネームなど（省略時はユーザー名と同じ）"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                        />
                        <FieldError messages={state.fieldErrors?.displayName} />
                    </div>

                    {/* パスワード（強度メーター付き） */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            パスワード
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            placeholder="8文字以上"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                        />
                        <PasswordStrengthMeter password={password} />
                        <FieldError messages={state.fieldErrors?.password} />
                    </div>

                    {/* セキュリティ質問 */}
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            秘密の質問
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            万が一パスワードを忘れても、この質問があれば安心して再設定できます
                        </p>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="securityQuestionId" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                質問を選択
                            </label>
                            <select
                                id="securityQuestionId"
                                name="securityQuestionId"
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                            >
                                <option value="">-- 質問を選んでください --</option>
                                {questions.map((q) => (
                                    <option key={q.id} value={q.id}>{q.text}</option>
                                ))}
                            </select>
                            <FieldError messages={state.fieldErrors?.securityQuestionId} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="securityAnswer" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                回答
                            </label>
                            <input
                                id="securityAnswer"
                                name="securityAnswer"
                                type="text"
                                autoComplete="off"
                                placeholder="回答を入力（大文字・小文字は区別されません）"
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                            />
                            <FieldError messages={state.fieldErrors?.securityAnswer} />
                        </div>
                    </div>

                    {state.error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            {state.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {isPending ? "登録中..." : "アカウントを作成する"}
                    </button>
                </form>

                <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700 text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        すでにアカウントをお持ちですか？{" "}
                        <Link href="/login" className="text-zinc-800 dark:text-zinc-200 underline underline-offset-2">
                            ログイン
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
}
