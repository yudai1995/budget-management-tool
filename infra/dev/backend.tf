# ============================================================
# Remote State Backend (S3 + DynamoDB)
#
# bootstrap/ で作成したリソースをバックエンドとして使用する。
# 初回適用前に以下を実行すること:
#   cd ../bootstrap && terraform apply
# ============================================================

terraform {
  backend "s3" {
    bucket         = "budget-dev-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "budget-dev-terraform-locks"
    encrypt        = true
  }
}
