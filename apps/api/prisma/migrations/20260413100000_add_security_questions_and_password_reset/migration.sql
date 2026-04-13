-- パスワードリカバリ用「秘密の質問」プリセット
CREATE TABLE `security_question_presets` (
  `id`   INT          NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- プリセット質問の初期データ
INSERT INTO `security_question_presets` (`text`) VALUES
  ('幼少期に住んでいた町・村の名前は？'),
  ('はじめて飼ったペットの名前は？'),
  ('子どもの頃の将来の夢は？'),
  ('母親の旧姓は？'),
  ('通っていた小学校の名前は？');

-- ユーザーが選択した秘密の質問と回答（answerHashはbcrypt）
CREATE TABLE `user_security_answers` (
  `id`          VARCHAR(26)  NOT NULL,
  `user_id`     VARCHAR(255) NOT NULL,
  `question_id` INT          NOT NULL,
  `answer_hash` VARCHAR(255) NOT NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_security_answers_user_id_key` (`user_id`),
  KEY `IDX_user_security_answers_user_id` (`user_id`),
  CONSTRAINT `fk_usa_question` FOREIGN KEY (`question_id`) REFERENCES `security_question_presets` (`id`),
  CONSTRAINT `fk_usa_user`     FOREIGN KEY (`user_id`)     REFERENCES `user_list` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- パスワードリセット用一時トークン
CREATE TABLE `password_reset_tokens` (
  `id`         VARCHAR(26)  NOT NULL,
  `token_hash` VARCHAR(64)  NOT NULL,
  `user_id`    VARCHAR(255) NOT NULL,
  `expires_at` DATETIME     NOT NULL,
  `used_at`    DATETIME     NULL,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_hash_key` (`token_hash`),
  KEY `IDX_password_reset_tokens_user_id` (`user_id`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
