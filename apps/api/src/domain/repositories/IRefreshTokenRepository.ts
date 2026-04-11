import type { RefreshToken } from '../models/RefreshToken';

export interface IRefreshTokenRepository {
    /** トークンを保存する */
    save(token: RefreshToken): Promise<void>;

    /** トークンハッシュで検索する */
    findByHash(tokenHash: string): Promise<RefreshToken | null>;

    /** 指定トークンを失効させる */
    revoke(id: string): Promise<void>;

    /** 指定ユーザーの全トークンを失効させる（侵害検知時） */
    revokeAllByUserId(userId: string): Promise<void>;

    /** 期限切れトークンを一括削除する（定期メンテナンス用） */
    deleteExpired(): Promise<void>;
}
