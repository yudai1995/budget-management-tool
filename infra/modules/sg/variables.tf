variable "name_prefix" {
  description = "リソース名前付けプレフィックス"
  type        = string
}

variable "vpc_id" {
  description = "セキュリティグループを作成する VPC ID"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR ブロック（sg-rds の ingress 制限に使用）"
  type        = string
}
