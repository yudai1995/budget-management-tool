import { serverFetch } from './client';
import type { GetXDayOutput } from '../../../../api/src/application/use-cases/xday/GetXDayUseCase';
import type { GetExpenditureAnalysisOutput } from '../../../../api/src/application/use-cases/xday/GetExpenditureAnalysisUseCase';

export type XDayData = GetXDayOutput & { snapshotAt: string };
export type AnalysisData = GetExpenditureAnalysisOutput;

export async function getXDay(totalAssets: number, monthlyIncome: number): Promise<XDayData> {
    return serverFetch<XDayData>(
        `/api/xday?totalAssets=${totalAssets}&monthlyIncome=${monthlyIncome}`
    );
}

export async function getExpenditureAnalysis(netDailyExpense: number): Promise<AnalysisData> {
    return serverFetch<AnalysisData>(
        `/api/xday/analysis?netDailyExpense=${netDailyExpense}`
    );
}
