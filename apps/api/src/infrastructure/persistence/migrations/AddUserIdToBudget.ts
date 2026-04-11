import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToBudget1710000001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            SET @col_exists = (
                SELECT COUNT(1)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'budget_list'
                  AND COLUMN_NAME = 'userId'
            );
        `);
        await queryRunner.query(`
            SET @sql = IF(
                @col_exists = 0,
                'ALTER TABLE budget_list ADD COLUMN userId varchar(255) NULL',
                'SELECT 1'
            );
        `);
        await queryRunner.query(`PREPARE stmt FROM @sql;`);
        await queryRunner.query(`EXECUTE stmt;`);
        await queryRunner.query(`DEALLOCATE PREPARE stmt;`);

        await queryRunner.query(`
            UPDATE budget_list
            SET userId = 'Guest'
            WHERE userId IS NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE budget_list
            MODIFY COLUMN userId varchar(255) NOT NULL;
        `);

        await queryRunner.query(`
            INSERT INTO user_list (userId, userName, password)
            SELECT 'Guest', 'Guest', ''
            WHERE NOT EXISTS (
                SELECT 1 FROM user_list WHERE userId = 'Guest'
            );
        `);

        await queryRunner.query(`
            SET @fk_exists = (
                SELECT COUNT(1)
                FROM information_schema.REFERENTIAL_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND CONSTRAINT_NAME = 'FK_budget_list_userId_user_list_userId'
            );
        `);
        await queryRunner.query(`
            SET @sql = IF(
                @fk_exists = 0,
                'ALTER TABLE budget_list ADD CONSTRAINT FK_budget_list_userId_user_list_userId FOREIGN KEY (userId) REFERENCES user_list(userId) ON DELETE CASCADE',
                'SELECT 1'
            );
        `);
        await queryRunner.query(`PREPARE stmt FROM @sql;`);
        await queryRunner.query(`EXECUTE stmt;`);
        await queryRunner.query(`DEALLOCATE PREPARE stmt;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            SET @fk_exists = (
                SELECT COUNT(1)
                FROM information_schema.REFERENTIAL_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND CONSTRAINT_NAME = 'FK_budget_list_userId_user_list_userId'
            );
        `);
        await queryRunner.query(`
            SET @sql = IF(
                @fk_exists = 1,
                'ALTER TABLE budget_list DROP FOREIGN KEY FK_budget_list_userId_user_list_userId',
                'SELECT 1'
            );
        `);
        await queryRunner.query(`PREPARE stmt FROM @sql;`);
        await queryRunner.query(`EXECUTE stmt;`);
        await queryRunner.query(`DEALLOCATE PREPARE stmt;`);

        await queryRunner.query(`
            SET @col_exists = (
                SELECT COUNT(1)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'budget_list'
                  AND COLUMN_NAME = 'userId'
            );
        `);
        await queryRunner.query(`
            SET @sql = IF(
                @col_exists = 1,
                'ALTER TABLE budget_list DROP COLUMN userId',
                'SELECT 1'
            );
        `);
        await queryRunner.query(`PREPARE stmt FROM @sql;`);
        await queryRunner.query(`EXECUTE stmt;`);
        await queryRunner.query(`DEALLOCATE PREPARE stmt;`);
    }
}
