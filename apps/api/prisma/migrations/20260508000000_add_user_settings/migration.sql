-- CreateTable
CREATE TABLE `user_settings` (
    `id` VARCHAR(26) NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `total_assets` INTEGER NOT NULL DEFAULT 0,
    `monthly_income` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
    INDEX `IDX_user_settings_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
