output "state_bucket_name" {
  description = "Terraform State 用 S3 バケット名（dev/backend.tf に記載）"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "lock_table_name" {
  description = "Terraform State ロック用 DynamoDB テーブル名（dev/backend.tf に記載）"
  value       = aws_dynamodb_table.terraform_locks.name
}
