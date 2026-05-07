/** ユーザー設定ドメインモデル（総資産・月次収入・給料日・固定費） */
export type UserSettings = {
    id: string;
    userId: string;
    totalAssets: number;
    monthlyIncome: number;
    /** 給料日（月の何日か: 1〜31） */
    paydayDay: number;
    /** 月次固定費合計（円） */
    fixedExpenses: number;
    createdAt: Date;
    updatedAt: Date;
};
