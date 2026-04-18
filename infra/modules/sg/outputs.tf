output "web_sg_id" {
  description = "sg-web ID（ECS Web タスクのネットワーク設定に使用）"
  value       = aws_security_group.web.id
}

output "api_sg_id" {
  description = "sg-api ID（ECS API タスクのネットワーク設定に使用）"
  value       = aws_security_group.api.id
}

output "rds_sg_id" {
  description = "sg-rds ID（RDS インスタンスのセキュリティグループに使用）"
  value       = aws_security_group.rds.id
}
