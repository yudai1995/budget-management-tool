"use client";

import { useActionState } from "react";
import { loginAction, guestLoginAction } from "@/lib/actions/auth";
import type { LoginState } from "@/lib/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SecurityBadges } from "@/components/common/SecurityBadges";

const initialState: LoginState = { error: null };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-xs font-medium text-[#f87171]">
      {messages[0]}
    </p>
  );
}

function NotificationBanner() {
  const params = useSearchParams();
  if (params.get("registered") === "1") {
    return (
      <p className="mb-4 rounded-xl border border-[#35b5a2]/40 bg-[#ecfaf8] px-3 py-2 text-sm font-medium text-[#1c1410]">
        アカウントを作成しました。ログインしてください。
      </p>
    );
  }
  if (params.get("reset") === "1") {
    return (
      <p className="mb-4 rounded-xl border border-[#35b5a2]/40 bg-[#ecfaf8] px-3 py-2 text-sm font-medium text-[#1c1410]">
        パスワードを再設定しました。新しいパスワードでログインしてください。
      </p>
    );
  }
  return null;
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffdf5] px-4">
      {/* 背景の幾何学デコレーション（控えめなサイズ） */}
      <div
        className="pointer-events-none fixed left-8 top-20 h-16 w-16 rounded-full border border-[#f18840]/20 bg-[#fff6ee]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed right-12 bottom-24 h-10 w-10 rotate-12 rounded-md border border-[#35b5a2]/20 bg-[#ecfaf8]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed left-1/4 bottom-16 h-7 w-7 rounded-sm border border-[#fbbf24]/30 bg-[#fef3c7]"
        aria-hidden="true"
      />

      <section
        className="w-full max-w-sm rounded-2xl border-2 border-[#1c1410] bg-white p-8"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1c1410] bg-[#f18840] text-base font-extrabold text-white"
            style={{ boxShadow: "var(--shadow-pop-sm)" }}
          >
            B
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#1c1410] leading-tight">
              ログイン
            </h1>
            <p className="text-xs text-[#1c1410]/50">家計を整えよう</p>
          </div>
        </div>

        <Suspense>
          <NotificationBanner />
        </Suspense>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="userId" className="text-sm font-semibold text-[#1c1410]">
              ユーザー名
            </label>
            <input
              id="userId"
              name="userId"
              type="text"
              required
              autoComplete="username"
              placeholder="ユーザー名を入力"
              className="input-pop"
            />
            <FieldError messages={state.fieldErrors?.userId} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-[#1c1410]">
                パスワード
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#1c1410]/50 underline underline-offset-2 hover:text-[#f18840] transition-colors"
              >
                忘れた場合
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="パスワードを入力"
              className="input-pop"
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>

          {state.error && (
            <p className="rounded-xl border border-[#f87171]/40 bg-[#fee2e2] px-3 py-2 text-sm font-medium text-[#1c1410]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-candy w-full mt-2 disabled:opacity-50"
          >
            {isPending ? "ログイン中..." : "ログインする"}
          </button>
        </form>

        <div className="mt-4 border-t border-[#e8c8b0] pt-4 space-y-3">
          <form action={guestLoginAction}>
            <button type="submit" className="btn-ghost w-full">
              ゲストユーザーでログイン
            </button>
          </form>
          <p className="text-center text-sm text-[#1c1410]/60">
            アカウントをお持ちでない方は{" "}
            <Link
              href="/register"
              className="font-semibold text-[#f18840] underline underline-offset-2 hover:text-[#e07030] transition-colors"
            >
              新規登録
            </Link>
          </p>
          <div className="flex justify-center pt-1">
            <SecurityBadges />
          </div>
        </div>
      </section>
    </div>
  );
}
