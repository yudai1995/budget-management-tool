import type { UserSettings } from '../../../domain/models/UserSettings';
import type { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';
import { ValidationError } from '../../../shared/errors/DomainException';
import { type Result, ok, err } from '../../../shared/types/result';

export type UpsertUserSettingsInput = {
    userId: string;
    totalAssets: number;
    monthlyIncome: number;
    /** 給料日（1〜31） */
    paydayDay: number;
    /** 月次固定費合計（円） */
    fixedExpenses: number;
};

/** 給料日の有効範囲 */
const PAYDAY_MIN = 1;
const PAYDAY_MAX = 31;

export class UpsertUserSettingsUseCase {
    constructor(private readonly userSettingsRepository: IUserSettingsRepository) {}

    async execute(input: UpsertUserSettingsInput): Promise<Result<UserSettings, ValidationError>> {
        if (input.totalAssets < 0) {
            return err(new ValidationError('総資産は0以上の値を入力してください'));
        }
        if (input.monthlyIncome < 0) {
            return err(new ValidationError('月次収入は0以上の値を入力してください'));
        }
        if (input.paydayDay < PAYDAY_MIN || input.paydayDay > PAYDAY_MAX) {
            return err(new ValidationError(`給料日は${PAYDAY_MIN}〜${PAYDAY_MAX}の範囲で入力してください`));
        }
        if (input.fixedExpenses < 0) {
            return err(new ValidationError('固定費は0以上の値を入力してください'));
        }
        const settings = await this.userSettingsRepository.upsert(input);
        return ok(settings);
    }
}
