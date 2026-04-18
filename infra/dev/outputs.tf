# ─── VPC ─────────────────────────────────────────────────────────────────────

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "パブリックサブネット ID リスト"
  value       = module.vpc.public_subnet_ids
}

# ─── IAM ─────────────────────────────────────────────────────────────────────

output "github_actions_role_arn" {
  description = "GitHubActionsRole ARN — GitHub Actions Secrets の role-to-assume に設定する"
  value       = module.iam.github_actions_role_arn
}

output "ecs_task_execution_role_arn" {
  description = "EcsTaskExecutionRole ARN — ECS タスク定義の executionRoleArn に設定する"
  value       = module.iam.ecs_task_execution_role_arn
}

# ─── ECR ─────────────────────────────────────────────────────────────────────

output "ecr_repository_urls" {
  description = "ECR リポジトリ URL マップ — docker push 先として使用"
  value       = module.ecr.repository_urls
}

# ─── SG ──────────────────────────────────────────────────────────────────────

output "sg_web_id" {
  description = "sg-web ID"
  value       = module.sg.web_sg_id
}

output "sg_api_id" {
  description = "sg-api ID"
  value       = module.sg.api_sg_id
}

output "sg_rds_id" {
  description = "sg-rds ID"
  value       = module.sg.rds_sg_id
}
