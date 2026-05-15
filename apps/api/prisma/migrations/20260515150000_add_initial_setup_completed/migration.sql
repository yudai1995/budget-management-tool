-- AlterTable: user_settings に初回設定完了フラグカラムを追加する
ALTER TABLE `user_settings`
    ADD COLUMN `initial_setup_completed` BOOLEAN NOT NULL DEFAULT false;
