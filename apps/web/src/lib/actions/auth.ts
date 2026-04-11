"use server";

import { redirect } from "next/navigation";
import { serverFetch, ApiError } from "../api/client";
import type { LoginResponse, LogoutResponse } from "../api/types";
import { errorModel, loginSchema } from "@budget/common";

export type LoginFieldErrors = {
  userId?: string[];
  password?: string[];
};

export type LoginState = {
  error: string | null;
  fieldErrors?: LoginFieldErrors;
};

/** ログイン Server Action */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    userId: String(formData.get("userId") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as LoginFieldErrors;
    return { error: null, fieldErrors };
  }

  try {
    await serverFetch<LoginResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify(result.data),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { error: errorModel.AUTHENTICATION_FAILD };
      }
      if (err.status === 403) {
        return { error: errorModel.NOT_FOUND };
      }
    }
    return { error: "サーバーに接続できませんでした" };
  }

  redirect("/expenses");
}

/** ゲストログイン Server Action */
export async function guestLoginAction(): Promise<void> {
  // パスワードは API 側で管理。web は credentials 不要。
  await serverFetch<LoginResponse>("/api/guest-login", { method: "POST" });
  redirect("/expenses");
}

/** ログアウト Server Action */
export async function logoutAction(): Promise<void> {
  await serverFetch<LogoutResponse>("/api/logout", { method: "POST" });
  redirect("/login");
}
