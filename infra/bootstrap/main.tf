# ============================================================
# Bootstrap: Terraform Remote State バックエンドの初期構築
#
# 適用順序:
#   1. cd infra/bootstrap && terraform init && terraform apply
#   2. cd infra/dev       && terraform init && terraform apply
#
# ⚠️ このモジュール自体は Local State で管理する（鶏卵問題）。
# ============================================================

locals {
  bucket_name  = "${var.project}-dev-terraform-state"
  dynamo_table = "${var.project}-dev-terraform-locks"
}

# ─── S3: Terraform State ────────────────────────────────────────────────────

resource "aws_s3_bucket" "terraform_state" {
  bucket = local.bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── DynamoDB: State Locking ──────────────────────────────────────────────────

resource "aws_dynamodb_table" "terraform_locks" {
  name         = local.dynamo_table
  billing_mode = "PAY_PER_REQUEST" # 無料枠対象・低頻度アクセスに最適
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
