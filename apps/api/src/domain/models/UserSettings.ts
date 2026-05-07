/** ユーザー設定ドメインモデル（総資産・月次収入） */
export type UserSettings = {
    id: string;
    userId: string;
    totalAssets: number;
    monthlyIncome: number;
    createdAt: Date;
    updatedAt: Date;
};
