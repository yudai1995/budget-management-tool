import type { UserSettings } from '../models/UserSettings';

export interface IUserSettingsRepository {
    /** ユーザーIDで設定を取得する（未設定時は null） */
    findByUserId(userId: string): Promise<UserSettings | null>;
    /** 設定を保存する（存在すれば更新、なければ作成） */
    upsert(settings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSettings>;
}
