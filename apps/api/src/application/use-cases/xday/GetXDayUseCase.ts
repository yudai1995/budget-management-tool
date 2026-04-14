import {
    DEFAULT_STATS_DAILY_EXPENSE,
    calcTrustWeight,
    calcEffectiveDailyExpense,
    calcNetDailyExpense,
    calcMinutesPerYen,
    calcRealtimeAssets,
} from '@budget/common';
import type { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';

interface GetXDayInput {
    userId: string;
    /** A: ユーザーが申告した総資産残高（円） */
    totalAssets: number;
    /** C: 月次固定収入（円/月）。0 は収入なしと同義 */
    monthlyIncome: number;
}

export interface GetXDayOutput {
    /** 資産枯渇予測日（ISO 8601 文字列）。null は収入 > 支出で枯渇しない */
    xDate: string | null;
    /** 残存日数。null は ∞ */
    daysRemaining: number | null;
    /** 実効日次支出 E（円/日） */
    effectiveDailyExpense: number;
    /** 純日次消費 E_net（円/日） */
    netDailyExpense: number;
    /** 信頼重み W（0.0〜1.0） */
    trustWeight: number;
    /** 1円あたりのXデー短縮時間（分） */
    minutesPerYen: number;
    /** リアルタイム資産残高（現在時刻での侵食カウント込み） */
    realtimeAssets: number;
    /** データ収集済み日数 */
    recordedDays: number;
    /** 直近30日の日次平均支出 B（円/日） */
    avgDailyExpense: number;
}

export class GetXDayUseCase {
    constructor(private readonly expenseRepository: IExpenseRepository) {}

    async execute(input: GetXDayInput): Promise<GetXDayOutput> {
        const { userId, totalAssets, monthlyIncome } = input;
        const now = new Date();

        const allExpenses = await this.expenseRepository.findByUserId(userId);

        // n: 記録済み日数（支出ありのユニーク日付数）
        const uniqueDates = new Set(allExpenses.filter((e) => e.balanceType === 0).map((e) => e.date));
        const recordedDays = uniqueDates.size;

        // B: 直近30日の支出合計 ÷ 30
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
        const recentExpenses = allExpenses.filter((e) => e.balanceType === 0 && new Date(e.date) >= thirtyDaysAgo);
        const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
        const avgDailyExpense = recentTotal / 30;

        const trustWeight = calcTrustWeight(recordedDays);
        const effectiveDailyExpense = calcEffectiveDailyExpense(
            avgDailyExpense,
            DEFAULT_STATS_DAILY_EXPENSE,
            trustWeight
        );
        const netDailyExpense = calcNetDailyExpense(effectiveDailyExpense, monthlyIncome);
        const minutesPerYen = calcMinutesPerYen(netDailyExpense);
        // lastUpdatedAt = now（APIリクエスト時点を基準にフロントがリアルタイム計算する）
        const realtimeAssets = calcRealtimeAssets(totalAssets, netDailyExpense, now, now);

        if (netDailyExpense <= 0) {
            return {
                xDate: null,
                daysRemaining: null,
                effectiveDailyExpense,
                netDailyExpense,
                trustWeight,
                minutesPerYen: 0,
                realtimeAssets: totalAssets,
                recordedDays,
                avgDailyExpense,
            };
        }

        const daysRemaining = Math.floor(totalAssets / netDailyExpense);
        const xDate = new Date(now.getTime() + daysRemaining * 86400_000);

        return {
            xDate: xDate.toISOString(),
            daysRemaining,
            effectiveDailyExpense,
            netDailyExpense,
            trustWeight,
            minutesPerYen,
            realtimeAssets,
            recordedDays,
            avgDailyExpense,
        };
    }
}
