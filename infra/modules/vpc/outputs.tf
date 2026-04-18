output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR ブロック"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "パブリックサブネット ID リスト（RDS SubnetGroup / ECS 配置に使用）"
  value       = [for s in aws_subnet.public : s.id]
}

output "public_subnet_map" {
  description = "AZ識別子 → サブネット ID のマップ"
  value       = { for k, s in aws_subnet.public : k => s.id }
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}
