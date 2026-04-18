variable "name_prefix" {
  description = "リソース名前付けプレフィックス"
  type        = string
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
}

variable "vpc_id" {
  description = "ECS サービスを配置する VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "ECS タスクを配置するサブネット ID リスト（パブリックサブネット）"
  type        = list(string)
}

variable "web_sg_id" {
  description = "sg-web セキュリティグループ ID"
  type        = string
}

variable "api_sg_id" {
  description = "sg-api セキュリティグループ ID"
  type        = string
}

variable "task_execution_role_arn" {
  description = "EcsTaskExecutionRole ARN"
  type        = string
}

variable "web_image" {
  description = "web コンテナイメージ URI（初期値。デプロイ後は GitHub Actions が更新）"
  type        = string
}

variable "api_image" {
  description = "api コンテナイメージ URI（初期値。デプロイ後は GitHub Actions が更新）"
  type        = string
}

variable "ssm_prefix" {
  description = "SSM Parameter Store のパスプレフィックス（例: /budget/dev）"
  type        = string
}

variable "cpu" {
  description = "タスク CPU ユニット（無料枠: 256 = 0.25 vCPU）"
  type        = number
  default     = 256
}

variable "memory" {
  description = "タスクメモリ MB（無料枠: 512MB）"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "サービスのタスク起動数（開発時は 0 にして無料枠を節約できる）"
  type        = number
  default     = 1
}
