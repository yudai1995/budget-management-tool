variable "project" {
  description = "プロジェクト名（リソース名前付けに使用）"
  type        = string
  default     = "budget"
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}
