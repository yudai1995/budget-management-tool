import { serverFetch } from "./client";

export type UserSettings = {
  totalAssets: number;
  monthlyIncome: number;
};

export async function getSettings(): Promise<UserSettings> {
  return serverFetch<UserSettings>("/api/settings");
}

export async function putSettings(data: UserSettings): Promise<UserSettings> {
  return serverFetch<UserSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
