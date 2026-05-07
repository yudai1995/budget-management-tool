import type { UserSettings } from '../../../domain/models/UserSettings';
import type { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';

export class GetUserSettingsUseCase {
    constructor(private readonly userSettingsRepository: IUserSettingsRepository) {}

    /** ユーザー設定を取得する。未設定の場合は null を返す */
    async execute(userId: string): Promise<UserSettings | null> {
        return this.userSettingsRepository.findByUserId(userId);
    }
}
