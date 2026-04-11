import type { DataSource } from 'typeorm';
import { RefreshToken } from '../../domain/models/RefreshToken';
import type { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { RefreshTokenDataModel } from './entity/RefreshTokenDataModel';

export class TypeORMRefreshTokenRepository implements IRefreshTokenRepository {
    constructor(private readonly dataSource: DataSource) {}

    async save(token: RefreshToken): Promise<void> {
        const model = this.dataSource.getRepository(RefreshTokenDataModel).create({
            id: token.id,
            tokenHash: token.tokenHash,
            userId: token.userId,
            expiresAt: token.expiresAt,
            revokedAt: token.revokedAt,
            createdAt: token.createdAt,
        });
        await this.dataSource.getRepository(RefreshTokenDataModel).save(model);
    }

    async findByHash(tokenHash: string): Promise<RefreshToken | null> {
        const model = await this.dataSource.getRepository(RefreshTokenDataModel).findOneBy({ tokenHash });

        if (!model) return null;

        return RefreshToken.reconstruct({
            id: model.id,
            tokenHash: model.tokenHash,
            userId: model.userId,
            expiresAt: model.expiresAt,
            revokedAt: model.revokedAt,
            createdAt: model.createdAt,
        });
    }

    async revoke(id: string): Promise<void> {
        await this.dataSource.getRepository(RefreshTokenDataModel).update({ id }, { revokedAt: new Date() });
    }

    async revokeAllByUserId(userId: string): Promise<void> {
        await this.dataSource
            .getRepository(RefreshTokenDataModel)
            .update({ userId, revokedAt: undefined }, { revokedAt: new Date() });
    }

    async deleteExpired(): Promise<void> {
        await this.dataSource
            .getRepository(RefreshTokenDataModel)
            .createQueryBuilder()
            .delete()
            .where('expires_at < :now', { now: new Date() })
            .execute();
    }
}
