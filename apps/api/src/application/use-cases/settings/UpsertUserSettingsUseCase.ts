import type { UserSettings } from '../../../domain/models/UserSettings';
import type { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';
import { ValidationError } from '../../../shared/errors/DomainException';

export type UpsertUserSettingsInput = {
    userId: string;
    totalAssets: number;
    monthlyIncome: number;
};

export class UpsertUserSettingsUseCase {
    constructor(private readonly userSettingsRepository: IUserSettingsRepository) {}

    async execute(input: UpsertUserSettingsInput): Promise<UserSettings> {
        if (input.totalAssets < 0) {
            throw new ValidationError('総資産は0以上の値を入力してください');
        }
        if (input.monthlyIncome < 0) {
            throw new ValidationError('月次収入は0以上の値を入力してください');
        }
        return this.userSettingsRepository.upsert(input);
    }
}
