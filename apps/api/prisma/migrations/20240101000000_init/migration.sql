-- CreateTable
CREATE TABLE `user_list` (
    `userId` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_list` (
    `id` VARCHAR(255) NOT NULL,
    `amount` INTEGER NOT NULL,
    `balanceType` INTEGER NOT NULL,
    `userId` VARCHAR(255) NOT NULL,
    `categoryId` INTEGER NOT NULL DEFAULT 1,
    `content` VARCHAR(255) NULL,
    `date` VARCHAR(255) NOT NULL,
    `createdDate` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedDate` DATETIME(6) NOT NULL,
    `deletedDate` DATETIME(6) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(26) NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `revoked_at` DATETIME NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `refresh_tokens_token_hash_key`(`token_hash`),
    INDEX `IDX_refresh_tokens_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budget_list` ADD CONSTRAINT `budget_list_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_list`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
