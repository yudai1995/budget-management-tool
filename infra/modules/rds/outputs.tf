output "db_endpoint" {
  description = "RDS MySQL エンドポイント（ホスト名）"
  value       = aws_db_instance.main.address
}

output "db_port" {
  description = "RDS MySQL ポート番号"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "RDS データベース名"
  value       = aws_db_instance.main.db_name
}

output "ssm_database_url_path" {
  description = "DATABASE_URL が格納された SSM パラメータパス"
  value       = aws_ssm_parameter.database_url.name
}

output "rds_sg_id" {
  description = "RDS 専用セキュリティグループ ID"
  value       = aws_security_group.rds.id
}
