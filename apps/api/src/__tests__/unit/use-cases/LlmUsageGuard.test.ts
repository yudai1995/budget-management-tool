import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlmUsageGuard } from '../../../application/services/LlmUsageGuard';
import type { ILlmUsageRepository } from '../../../domain/repositories/ILlmUsageRepository';
import { UsageLimitError } from '../../../shared/errors/DomainException';

const mockRepo: ILlmUsageRepository = {
    countTodayByUserAndFeature: vi.fn(),
    sumMonthlyTokensByUser: vi.fn(),
    record: vi.fn(),
};

describe('LlmUsageGuard', () => {
    let guard: LlmUsageGuard;

    beforeEach(() => {
        vi.clearAllMocks();
        // デフォルト制限値を環境変数で固定
        process.env.LLM_DAILY_LIMIT_PER_USER = '3';
        process.env.LLM_MONTHLY_TOKEN_LIMIT = '50000';
        guard = new LlmUsageGuard(mockRepo);
    });

    it('正常系: 制限内のとき throw しない', async () => {
        vi.mocked(mockRepo.countTodayByUserAndFeature).mockResolvedValue(2);
        vi.mocked(mockRepo.sumMonthlyTokensByUser).mockResolvedValue(10_000);

        await expect(guard.checkLimit('user-1', 'report_analysis')).resolves.toBeUndefined();
    });

    it('異常系: 当日上限に達したとき UsageLimitError を throw する', async () => {
        vi.mocked(mockRepo.countTodayByUserAndFeature).mockResolvedValue(3);
        vi.mocked(mockRepo.sumMonthlyTokensByUser).mockResolvedValue(0);

        await expect(guard.checkLimit('user-1', 'report_analysis')).rejects.toBeInstanceOf(UsageLimitError);
    });

    it('異常系: 月間トークン上限に達したとき UsageLimitError を throw する', async () => {
        vi.mocked(mockRepo.countTodayByUserAndFeature).mockResolvedValue(0);
        vi.mocked(mockRepo.sumMonthlyTokensByUser).mockResolvedValue(50_000);

        await expect(guard.checkLimit('user-1', 'expense_parse')).rejects.toBeInstanceOf(UsageLimitError);
    });

    it('正常系: recordUsage がリポジトリの record を呼ぶ', async () => {
        vi.mocked(mockRepo.record).mockResolvedValue(undefined);

        await guard.recordUsage({
            userId: 'user-1',
            feature: 'report_analysis',
            inputTokens: 100,
            outputTokens: 50,
        });

        expect(mockRepo.record).toHaveBeenCalledOnce();
        expect(mockRepo.record).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-1',
                feature: 'report_analysis',
                inputTokens: 100,
                outputTokens: 50,
            })
        );
    });
});
