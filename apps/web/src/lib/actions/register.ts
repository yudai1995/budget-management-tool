"use server";

import { redirect } from "next/navigation";
import { serverFetch, ApiError } from "../api/client";
import { registerSchema } from "@budget/common";

export type RegisterFieldErrors = {
    userId?: string[];
    displayName?: string[];
    password?: string[];
    securityQuestionId?: string[];
    securityAnswer?: string[];
};

export type RegisterState = {
    error: string | null;
    fieldErrors?: RegisterFieldErrors;
};

/** ユーザー自己登録 Server Action */
export async function registerAction(
    _prev: RegisterState,
    formData: FormData,
): Promise<RegisterState> {
    const raw = {
        userId: String(formData.get("userId") ?? ""),
        displayName: String(formData.get("displayName") ?? "") || undefined,
        password: String(formData.get("password") ?? ""),
        securityQuestionId: Number(formData.get("securityQuestionId") ?? 0),
        securityAnswer: String(formData.get("securityAnswer") ?? ""),
    };

    const result = registerSchema.safeParse(raw);
    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors as RegisterFieldErrors;
        return { error: null, fieldErrors };
    }

    try {
        await serverFetch("/api/register", {
            method: "POST",
            body: JSON.stringify(result.data),
        });
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.status === 400) {
                return { error: err.message };
            }
        }
        return { error: "登録に失敗しました。しばらくしてからもう一度お試しください" };
    }

    redirect("/login?registered=1");
}
