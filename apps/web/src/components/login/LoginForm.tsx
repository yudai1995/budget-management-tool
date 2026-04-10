"use client";

import { useActionState } from "react";
import { loginAction, guestLoginAction } from "@/lib/actions/auth";
import type { LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { error: null };

/** フィールドエラーを表示するヘルパー */
function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
      {messages[0]}
    </p>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <section className="w-full max-w-sm rounded-xl bg-white p-8 shadow dark:bg-zinc-800">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          ログイン
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="userId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ユーザー名
            </label>
            <input
              id="userId"
              name="userId"
              type="text"
              required
              autoComplete="off"
              placeholder="ユーザー名を入力"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
            <FieldError messages={state.fieldErrors?.userId} />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="パスワードを入力"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
            <FieldError messages={state.fieldErrors?.password} />
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
            {isPending ? "ログイン中..." : "ログインする"}
          </button>
        </form>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <form action={guestLoginAction}>
            <button
              type="submit"
              className="w-full rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              ゲストユーザーでログイン
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
