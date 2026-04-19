variable "name_prefix" {
  description = "リソース名前付けプレフィックス（例: budget-dev）"
  type        = string
}

variable "aws_region" {
  description = "AWS リージョン"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "DB Subnet Group に使用するプライベートサブネット ID リスト"
  type        = list(string)
}

variable "api_sg_id" {
  description = "ECS API セキュリティグループ ID（RDS への 3306 ingress 許可元）"
  type        = string
}

variable "ssm_prefix" {
  description = "SSM Parameter Store パスプレフィックス（例: /budget/dev）"
  type        = string
}

variable "db_name" {
  description = "RDS データベース名"
  type        = string
  default     = "budget_dev"
}

variable "db_username" {
  description = "RDS マスターユーザー名"
  type        = string
  default     = "admin"
}

variable "db_instance_class" {
  description = "RDS インスタンスクラス（コスト最優先: db.t4g.micro ~$13/月）"
  type        = string
  default     = "db.t4g.micro"
}
