import { ulid } from 'ulid';
import { UsageLimitError } from '../../shared/errors/DomainException';
import type { ILlmUsageRepository } from '../../domain/repositories/ILlmUsageRepository';

const DAILY_LIMIT = Number(process.env.LLM_DAILY_LIMIT_PER_USER ?? 3);
const MONTHLY_TOKEN_LIMIT = Number(process.env.LLM_MONTHLY_TOKEN_LIMIT ?? 50_000);

export class LlmUsageGuard {
    constructor(private readonly repo: ILlmUsageRepository) {}

    /**
     * 呼び出し前に使用制限を確認し、超過していたら UsageLimitError を throw する。
     * 使用分を記録するには recordUsage を使うこと。
     */
    async checkLimit(userId: string, feature: string): Promise<void> {
        const [todayCount, monthlyTokens] = await Promise.all([
            this.repo.countTodayByUserAndFeature(userId, feature),
            this.repo.sumMonthlyTokensByUser(userId),
        ]);

        if (todayCount >= DAILY_LIMIT) {
            throw new UsageLimitError(`本日の AI 機能（${feature}）の利用上限（${DAILY_LIMIT}回）に達しています`);
        }
        if (monthlyTokens >= MONTHLY_TOKEN_LIMIT) {
            throw new UsageLimitError(`今月の AI トークン使用量の上限（${MONTHLY_TOKEN_LIMIT}トークン）に達しています`);
        }
    }

    /** AI 呼び出し後に使用量を記録する */
    async recordUsage(params: {
        userId: string;
        feature: string;
        inputTokens: number;
        outputTokens: number;
    }): Promise<void> {
        await this.repo.record({
            id: ulid(),
            userId: params.userId,
            feature: params.feature,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens,
        });
    }
}
