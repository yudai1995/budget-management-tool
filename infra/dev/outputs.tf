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

# ─── ECS ─────────────────────────────────────────────────────────────────────

output "ecs_cluster_name" {
  description = "ECS クラスター名 — GitHub Actions Secrets: ECS_CLUSTER"
  value       = module.ecs.cluster_name
}

output "ecs_web_service_name" {
  description = "ECS web サービス名 — GitHub Actions Secrets: ECS_SERVICE_WEB"
  value       = module.ecs.web_service_name
}

output "ecs_api_service_name" {
  description = "ECS api サービス名 — GitHub Actions Secrets: ECS_SERVICE_API"
  value       = module.ecs.api_service_name
}

output "ecs_web_task_family" {
  description = "ECS web タスクファミリー — GitHub Actions Secrets: ECS_TASK_FAMILY_WEB"
  value       = module.ecs.web_task_family
}

output "ecs_api_task_family" {
  description = "ECS api タスクファミリー — GitHub Actions Secrets: ECS_TASK_FAMILY_API"
  value       = module.ecs.api_task_family
}

# ─── CloudFront ───────────────────────────────────────────────────────────────

output "cloudfront_distribution_id" {
  description = "CloudFront ディストリビューション ID — GitHub Actions Secrets: CLOUDFRONT_DIST_ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront ドメイン名（アクセス URL）"
  value       = "https://${module.cloudfront.distribution_domain_name}"
}

# ─── RDS ─────────────────────────────────────────────────────────────────────

output "rds_endpoint" {
  description = "RDS MySQL エンドポイント（ホスト名）"
  value       = module.rds.db_endpoint
}

output "rds_ssm_database_url_path" {
  description = "DATABASE_URL が格納された SSM パラメータパス（アプリ側で valueFrom に指定）"
  value       = module.rds.ssm_database_url_path
}
