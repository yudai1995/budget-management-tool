export interface ILlmUsageRepository {
    /** 指定ユーザー・機能の当日呼び出し回数を取得する */
    countTodayByUserAndFeature(userId: string, feature: string): Promise<number>;
    /** 指定ユーザーの当月累積トークン数を取得する */
    sumMonthlyTokensByUser(userId: string): Promise<number>;
    /** 使用記録を保存する */
    record(params: {
        id: string;
        userId: string;
        feature: string;
        inputTokens: number;
        outputTokens: number;
    }): Promise<void>;
}
