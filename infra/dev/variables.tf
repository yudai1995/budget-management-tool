variable "project" {
  description = "プロジェクト名（リソース名前付けプレフィックスに使用）"
  type        = string
  default     = "budget"
}

variable "env" {
  description = "環境名（dev / stg / prod）"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "github_org" {
  description = "GitHub 組織名またはユーザー名"
  type        = string
}

variable "github_repo" {
  description = "GitHub リポジトリ名"
  type        = string
}

variable "budget_limit_usd" {
  description = "月次コスト上限（USD）。超過時にアラートメールを送信する"
  type        = string
  default     = "1"
}

variable "alert_email" {
  description = "コスト超過アラートの送信先メールアドレス"
  type        = string
}

variable "ssm_prefix" {
  description = "SSM Parameter Store のパスプレフィックス（例: /budget/dev）"
  type        = string
  default     = "/budget/dev"
}

variable "initial_web_origin_domain" {
  description = "CloudFront オリジンの初期ドメイン（terraform apply 後に scripts/update-cloudfront-origin.sh で自動更新）"
  type        = string
  default     = "placeholder.example.com" # placeholder: 初回デプロイ後に自動更新される
}

# ─── RDS 設定 ─────────────────────────────────────────────────────────────────

variable "db_name" {
  description = "RDS データベース名"
  type        = string
  default     = "budget_dev"
}

variable "db_username" {
  description = "RDS マスターユーザー名（パスワードは random_password で自動生成）"
  type        = string
  default     = "admin"
}
