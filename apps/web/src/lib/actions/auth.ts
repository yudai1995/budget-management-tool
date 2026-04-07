"use server";

import { redirect } from "next/navigation";
import { serverFetch, ApiError } from "../api/client";
import type { LoginResponse, LogoutResponse } from "../api/types";
import { errorModel } from "@budget/common";

export type LoginState = {
  error: string | null;
};

/** ログイン Server Action */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const userId = formData.get("userId");
  const password = formData.get("password");

  if (!userId || !password) {
    return { error: "ユーザーIDとパスワードを入力してください" };
  }

  try {
    await serverFetch<LoginResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify({ userId, password }),
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
  await serverFetch<LoginResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify({ userId: "Guest" }),
  });

  redirect("/expenses");
}

/** ログアウト Server Action */
export async function logoutAction(): Promise<void> {
  await serverFetch<LogoutResponse>("/api/logout", { method: "POST" });
  redirect("/login");
}
