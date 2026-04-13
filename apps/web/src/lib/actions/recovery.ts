"use server";

import { redirect } from "next/navigation";
import { serverFetch, ApiError } from "../api/client";
import { verifyRecoverySchema, resetPasswordSchema } from "@budget/common";

// ─── 秘密の質問取得 ───────────────────────────────────────────────

export type LookupState = {
    error: string | null;
    question?: { questionId: number; questionText: string };
    userId?: string;
};

export async function lookupRecoveryAction(
    _prev: LookupState,
    formData: FormData,
): Promise<LookupState> {
    const userId = String(formData.get("userId") ?? "").trim();
    if (!userId) return { error: "ユーザー名を入力してください" };

    try {
        const question = await serverFetch<{ questionId: number; questionText: string }>(
            `/api/recovery/question?userId=${encodeURIComponent(userId)}`,
            { method: "GET" },
        );
        return { error: null, question, userId };
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
            return { error: "秘密の質問が設定されていないか、ユーザーが存在しません" };
        }
        return { error: "サーバーに接続できませんでした" };
    }
}

// ─── 回答照合 ─────────────────────────────────────────────────────

export type VerifyState = {
    error: string | null;
    resetToken?: string;
    expiresAt?: string;
};

export async function verifyRecoveryAction(
    _prev: VerifyState,
    formData: FormData,
): Promise<VerifyState> {
    const raw = {
        userId: String(formData.get("userId") ?? ""),
        answer: String(formData.get("answer") ?? ""),
    };

    const result = verifyRecoverySchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.errors[0]?.message ?? "入力が不正です" };
    }

    try {
        const res = await serverFetch<{ result: string; resetToken: string; expiresAt: string }>(
            "/api/recovery/verify",
            { method: "POST", body: JSON.stringify(result.data) },
        );
        return { error: null, resetToken: res.resetToken, expiresAt: res.expiresAt };
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            return { error: "回答が正しくありません" };
        }
        if (err instanceof ApiError && err.status === 404) {
            return { error: "秘密の質問が設定されていないか、ユーザーが存在しません" };
        }
        return { error: "サーバーに接続できませんでした" };
    }
}

// ─── パスワードリセット ───────────────────────────────────────────

export type ResetPasswordState = {
    error: string | null;
};

export async function resetPasswordAction(
    _prev: ResetPasswordState,
    formData: FormData,
): Promise<ResetPasswordState> {
    const raw = {
        resetToken: String(formData.get("resetToken") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
    };

    const result = resetPasswordSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.errors[0]?.message ?? "入力が不正です" };
    }

    try {
        await serverFetch("/api/recovery/reset-password", {
            method: "POST",
            body: JSON.stringify(result.data),
        });
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            return { error: "リセットトークンが無効または期限切れです。最初からやり直してください" };
        }
        return { error: "サーバーに接続できませんでした" };
    }

    redirect("/login?reset=1");
}
