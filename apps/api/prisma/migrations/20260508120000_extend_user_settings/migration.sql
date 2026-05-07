-- AlterTable: user_settings に給料日・固定費カラムを追加する
ALTER TABLE `user_settings`
    ADD COLUMN `payday_day` INTEGER NOT NULL DEFAULT 25,
    ADD COLUMN `fixed_expenses` INTEGER NOT NULL DEFAULT 0;
