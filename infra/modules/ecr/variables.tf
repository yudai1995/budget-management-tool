variable "name_prefix" {
  description = "リソース名前付けプレフィックス"
  type        = string
}

variable "repositories" {
  description = "作成する ECR リポジトリ名サフィックスのリスト（例: [\"web\", \"api\"]）"
  type        = list(string)
  default     = ["web", "api"]
}

variable "max_image_count" {
  description = "保持するイメージの最大世代数（無料枠 500MB/月 を超過させないため制限）"
  type        = number
  default     = 5
}

variable "force_delete" {
  description = "リポジトリ削除時にイメージが残っていても強制削除するか（dev 環境のみ true 推奨）"
  type        = bool
  default     = true
}
