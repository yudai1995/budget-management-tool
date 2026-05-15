import { serverFetch } from "./client";
import type { UserSettingsResponse, UpsertUserSettingsBody } from "@budget/api-client";

// 後方互換エイリアス（既存コードが参照中）
export type UserSettings = UserSettingsResponse;

export async function getSettings(): Promise<UserSettingsResponse> {
  return serverFetch<UserSettingsResponse>("/api/settings");
}

export async function putSettings(data: UpsertUserSettingsBody): Promise<UserSettingsResponse> {
  return serverFetch<UserSettingsResponse>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
