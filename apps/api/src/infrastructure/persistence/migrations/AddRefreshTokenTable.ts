import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenTable1744373800000 implements MigrationInterface {
    name = 'AddRefreshTokenTable1744373800000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`refresh_tokens\` (
                \`id\`         VARCHAR(26)  NOT NULL,
                \`token_hash\` VARCHAR(64)  NOT NULL,
                \`user_id\`    VARCHAR(255) NOT NULL,
                \`expires_at\` DATETIME     NOT NULL,
                \`revoked_at\` DATETIME     NULL DEFAULT NULL,
                \`created_at\` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_refresh_tokens_token_hash\` (\`token_hash\`),
                INDEX \`IDX_refresh_tokens_user_id\` (\`user_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS `refresh_tokens`');
    }
}
