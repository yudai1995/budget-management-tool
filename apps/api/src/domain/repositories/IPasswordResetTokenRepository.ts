export interface IPasswordResetTokenRepository {
    /** リセットトークンを発行して保存し、平文トークンを返す */
    issue(userId: string): Promise<{ token: string; expiresAt: Date }>;

    /** トークンを照合し、有効なら userId を返す。無効・期限切れは null */
    verify(plainToken: string): Promise<string | null>;

    /** トークンを使用済みにする */
    consume(plainToken: string): Promise<void>;
}
