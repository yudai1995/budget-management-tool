variable "name_prefix" {
  description = "リソース名前付けプレフィックス"
  type        = string
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
}

variable "github_org" {
  description = "GitHub 組織名またはユーザー名"
  type        = string
}

variable "github_repo" {
  description = "GitHub リポジトリ名"
  type        = string
}

variable "ssm_prefix" {
  description = "SSM Parameter Store のパスプレフィックス（例: /budget/dev）。IAM ポリシーのリソース ARN 生成に使用"
  type        = string
}

variable "rds_resource_id" {
  description = "RDS インスタンスの Resource ID（例: db-XXXXXXXXXX）。IAM DB Auth の rds-db:connect リソース指定に使用。空文字の場合は権限を付与しない"
  type        = string
  default     = ""
}

variable "github_thumbprints" {
  description = "GitHub OIDC エンドポイントの TLS 証明書フィンガープリント（証明書ローテーション対応のため複数指定）"
  type        = list(string)
  default = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}
