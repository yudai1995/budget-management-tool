-- CreateTable: LLM 使用ログテーブル（使用制限チェック・コスト管理用）
CREATE TABLE `llm_usage` (
    `id` VARCHAR(26) NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `feature` VARCHAR(50) NOT NULL,
    `input_tokens` INTEGER NOT NULL,
    `output_tokens` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `IDX_llm_usage_user_feature_created`(`user_id`, `feature`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
