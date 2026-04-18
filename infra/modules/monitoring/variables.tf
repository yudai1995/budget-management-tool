variable "name_prefix" {
  description = "リソース名前付けプレフィックス"
  type        = string
}

variable "alert_email" {
  description = "アラート通知の送信先メールアドレス"
  type        = string
}

variable "ecs_cluster_name" {
  description = "監視対象の ECS クラスター名"
  type        = string
}

variable "ecs_api_service_name" {
  description = "監視対象の ECS api サービス名"
  type        = string
}

variable "api_5xx_threshold" {
  description = "5 分間の 5xx エラー数がこの値を超えたらアラート"
  type        = number
  default     = 10
}

variable "budget_limit_usd" {
  description = "月次コスト上限（USD）"
  type        = string
  default     = "1"
}
