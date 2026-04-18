output "distribution_id" {
  description = "CloudFront ディストリビューション ID（GitHub Actions Secrets の CLOUDFRONT_DIST_ID に設定）"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_domain_name" {
  description = "CloudFront ドメイン名（例: d1234abcd.cloudfront.net）"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "distribution_arn" {
  description = "CloudFront ディストリビューション ARN"
  value       = aws_cloudfront_distribution.main.arn
}
