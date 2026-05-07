"use server";

import { putSettings } from "@/lib/api/settings";

export type SettingsActionState = {
  error: string | null;
  success: boolean;
};

/** 総資産・月次収入をサーバーに保存する Server Action */
export async function upsertSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const totalAssets = Number(formData.get("totalAssets") ?? 0);
  const monthlyIncome = Number(formData.get("monthlyIncome") ?? 0);

  if (Number.isNaN(totalAssets) || totalAssets < 0) {
    return { error: "総資産は0以上の値を入力してください", success: false };
  }
  if (Number.isNaN(monthlyIncome) || monthlyIncome < 0) {
    return { error: "月次収入は0以上の値を入力してください", success: false };
  }

  try {
    await putSettings({ totalAssets, monthlyIncome });
    return { error: null, success: true };
  } catch {
    return { error: "保存に失敗しました。しばらくしてから再度お試しください", success: false };
  }
}
