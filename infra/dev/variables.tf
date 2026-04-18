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
