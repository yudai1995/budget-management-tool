import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // TypeORM の Table/Column 型シグネチャ差異を避けるため、DDL を直接発行します。
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS user_list (
                userId varchar(255) NOT NULL,
                userName varchar(255) NOT NULL,
                password varchar(255) NOT NULL,
                PRIMARY KEY (userId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS budget_list (
                id varchar(255) NOT NULL,
                amount int NOT NULL,
                balanceType enum('0','1') NOT NULL,
                categoryId int NOT NULL DEFAULT 1,
                content varchar(255) NULL,
                date varchar(255) NOT NULL,
                createdDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                deletedDate datetime(6) NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS budget_list;`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_list;`);
    }
}
