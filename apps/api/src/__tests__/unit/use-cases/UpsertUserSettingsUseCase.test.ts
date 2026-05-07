import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpsertUserSettingsUseCase } from '../../../application/use-cases/settings/UpsertUserSettingsUseCase';
import type { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';
import type { UserSettings } from '../../../domain/models/UserSettings';
import { ValidationError } from '../../../shared/errors/DomainException';

const mockSettings: UserSettings = {
    id: 'ulid-001',
    userId: 'user-001',
    totalAssets: 5000000,
    monthlyIncome: 200000,
    createdAt: new Date('2026-05-08T00:00:00.000Z'),
    updatedAt: new Date('2026-05-08T00:00:00.000Z'),
};

const mockRepo: IUserSettingsRepository = {
    findByUserId: vi.fn(),
    upsert: vi.fn(),
};

describe('UpsertUserSettingsUseCase', () => {
    let useCase: UpsertUserSettingsUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new UpsertUserSettingsUseCase(mockRepo);
    });

    it('正常系: 総資産・月次収入を保存できる', async () => {
        vi.mocked(mockRepo.upsert).mockResolvedValue(mockSettings);

        const result = await useCase.execute({
            userId: 'user-001',
            totalAssets: 5000000,
            monthlyIncome: 200000,
        });

        expect(result).toEqual(mockSettings);
        expect(mockRepo.upsert).toHaveBeenCalledWith({
            userId: 'user-001',
            totalAssets: 5000000,
            monthlyIncome: 200000,
        });
    });

    it('正常系: 月次収入 0 で保存できる', async () => {
        vi.mocked(mockRepo.upsert).mockResolvedValue({ ...mockSettings, monthlyIncome: 0 });

        const result = await useCase.execute({
            userId: 'user-001',
            totalAssets: 1000000,
            monthlyIncome: 0,
        });

        expect(result.monthlyIncome).toBe(0);
    });

    it('正常系: 総資産 0 で保存できる', async () => {
        vi.mocked(mockRepo.upsert).mockResolvedValue({ ...mockSettings, totalAssets: 0 });

        const result = await useCase.execute({
            userId: 'user-001',
            totalAssets: 0,
            monthlyIncome: 0,
        });

        expect(result.totalAssets).toBe(0);
    });

    it('異常系: 総資産が負数のとき ValidationError をスローする', async () => {
        await expect(useCase.execute({ userId: 'user-001', totalAssets: -1, monthlyIncome: 0 })).rejects.toThrow(
            ValidationError
        );
    });

    it('異常系: 月次収入が負数のとき ValidationError をスローする', async () => {
        await expect(useCase.execute({ userId: 'user-001', totalAssets: 0, monthlyIncome: -1 })).rejects.toThrow(
            ValidationError
        );
    });
});
