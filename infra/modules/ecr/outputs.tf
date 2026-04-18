output "repository_urls" {
  description = "リポジトリ名 → URL のマップ（docker push 先として使用）"
  value       = { for k, v in aws_ecr_repository.this : k => v.repository_url }
}

output "repository_arns" {
  description = "リポジトリ名 → ARN のマップ（IAM ポリシーリソース指定に使用）"
  value       = { for k, v in aws_ecr_repository.this : k => v.arn }
}
