variable "name_prefix" {
  description = "リソース名前付けプレフィックス（例: budget-dev）"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC の CIDR ブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "パブリックサブネット定義（key = AZ識別子、value = cidr + az）"
  type = map(object({
    cidr = string
    az   = string
  }))
  default = {
    a = { cidr = "10.0.1.0/24", az = "ap-northeast-1a" }
    c = { cidr = "10.0.2.0/24", az = "ap-northeast-1c" }
  }
}
