import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserSettingsUseCase } from '../../../application/use-cases/settings/GetUserSettingsUseCase';
import type { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';
import type { UserSettings } from '../../../domain/models/UserSettings';

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

describe('GetUserSettingsUseCase', () => {
    let useCase: GetUserSettingsUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new GetUserSettingsUseCase(mockRepo);
    });

    it('正常系: 設定が存在するとき UserSettings を返す', async () => {
        vi.mocked(mockRepo.findByUserId).mockResolvedValue(mockSettings);

        const result = await useCase.execute('user-001');

        expect(result).toEqual(mockSettings);
        expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-001');
    });

    it('正常系: 未設定のとき null を返す', async () => {
        vi.mocked(mockRepo.findByUserId).mockResolvedValue(null);

        const result = await useCase.execute('user-001');

        expect(result).toBeNull();
    });
});
