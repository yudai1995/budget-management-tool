"use client";

import { useActionState } from "react";
import { loginAction, guestLoginAction } from "@/lib/actions/auth";
import type { LoginState } from "@/lib/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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

/** クエリパラメータに応じた通知バナー */
function NotificationBanner() {
  const params = useSearchParams();
  if (params.get("registered") === "1") {
    return (
      <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
        アカウントを作成しました。ログインしてください。
      </p>
    );
  }
  if (params.get("reset") === "1") {
    return (
      <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
        パスワードを再設定しました。新しいパスワードでログインしてください。
      </p>
    );
  }
  return null;
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <section className="w-full max-w-sm rounded-xl bg-white p-8 shadow dark:bg-zinc-800">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          ログイン
        </h1>

        {/* セキュリティ宣言 */}
        <div className="mb-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p>🔒 データは暗号化されサーバーに安全に保存されます</p>
          <p>👤 メールアドレス不要。プライバシーを保護した匿名利用が可能です</p>
        </div>

        <Suspense>
          <NotificationBanner />
        </Suspense>

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
              autoComplete="username"
              placeholder="ユーザー名を入力"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            />
            <FieldError messages={state.fieldErrors?.userId} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                パスワード
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-500 dark:text-zinc-400 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                パスワードを忘れた場合
              </Link>
            </div>
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

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700 space-y-3">
          <form action={guestLoginAction}>
            <button
              type="submit"
              className="w-full rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              ゲストユーザーでログイン
            </button>
          </form>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            アカウントをお持ちでない方は{" "}
            <Link href="/register" className="text-zinc-800 dark:text-zinc-200 underline underline-offset-2">
              新規登録
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
