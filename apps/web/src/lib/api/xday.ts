import { serverFetch } from './client';
import type { XDayResponse, ExpenditureAnalysisResponse } from '@budget/api-client';

// 後方互換エイリアス（既存コンポーネントが参照中）
export type XDayData = XDayResponse;
export type AnalysisData = ExpenditureAnalysisResponse;

export async function getXDay(totalAssets: number, monthlyIncome: number): Promise<XDayResponse> {
    return serverFetch<XDayResponse>(
        `/api/xday?totalAssets=${totalAssets}&monthlyIncome=${monthlyIncome}`
    );
}

export async function getExpenditureAnalysis(netDailyExpense: number): Promise<ExpenditureAnalysisResponse> {
    return serverFetch<ExpenditureAnalysisResponse>(
        `/api/xday/analysis?netDailyExpense=${netDailyExpense}`
    );
}
