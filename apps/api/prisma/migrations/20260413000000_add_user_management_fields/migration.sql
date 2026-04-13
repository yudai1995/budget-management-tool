-- ユーザー管理フィールドの追加
-- ADR-007: ユーザー管理機能の設計方針に基づき、role / status / email / タイムスタンプを追加

-- UserList テーブルに新規カラムを追加
ALTER TABLE `user_list`
  ADD COLUMN `email`      VARCHAR(255) NULL,
  ADD COLUMN `role`       ENUM('ADMIN', 'USER', 'GUEST') NOT NULL DEFAULT 'USER',
  ADD COLUMN `status`     ENUM('ACTIVE', 'INACTIVE')     NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  ADD COLUMN `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

-- ゲストユーザーのロールを GUEST に更新
UPDATE `user_list` SET `role` = 'GUEST' WHERE `userId` = 'Guest';

-- email のユニーク制約
CREATE UNIQUE INDEX `user_list_email_key` ON `user_list`(`email`);
