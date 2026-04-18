variable "name_prefix" {
  description = "リソース名前付けプレフィックス"
  type        = string
}

variable "web_origin_domain" {
  description = "CloudFront オリジンドメイン（ECS web タスクの Public IP または DNS）"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM 証明書 ARN（us-east-1 リージョンで発行したもの）。null の場合は HTTP のみ"
  type        = string
  default     = null
}

variable "price_class" {
  description = "CloudFront 価格クラス（PriceClass_100: 北米+欧州のみで最安）"
  type        = string
  default     = "PriceClass_100"
}

variable "origin_shield_secret_ssm_path" {
  description = "Origin Shield シークレットトークンを格納する SSM Parameter Store のパス（例: /budget/dev/cf_origin_secret）"
  type        = string
}
