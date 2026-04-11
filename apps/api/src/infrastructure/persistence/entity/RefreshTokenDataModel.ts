import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/** refresh_tokens テーブルに対応する TypeORM エンティティ */
@Entity({ name: 'refresh_tokens' })
export class RefreshTokenDataModel {
    @PrimaryColumn({ type: 'varchar', length: 26, name: 'id' })
    id: string;

    /** SHA-256 ハッシュ済みトークン（平文は保存しない） */
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 64, name: 'token_hash' })
    tokenHash: string;

    @Column({ type: 'varchar', length: 255, name: 'user_id' })
    userId: string;

    @Column({ type: 'datetime', name: 'expires_at' })
    expiresAt: Date;

    @Column({ type: 'datetime', nullable: true, name: 'revoked_at', default: null })
    revokedAt: Date | null;

    @CreateDateColumn({ type: 'datetime', precision: 6, name: 'created_at' })
    createdAt: Date;
}
