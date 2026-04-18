output "github_oidc_provider_arn" {
  description = "GitHub Actions OIDC ID プロバイダー ARN"
  value       = aws_iam_openid_connect_provider.github.arn
}

output "github_actions_role_arn" {
  description = "GitHubActionsRole ARN（GitHub Actions Secrets の role-to-assume に設定）"
  value       = aws_iam_role.github_actions.arn
}

output "ecs_task_execution_role_arn" {
  description = "EcsTaskExecutionRole ARN（ECS タスク定義の executionRoleArn に設定）"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_execution_role_name" {
  description = "EcsTaskExecutionRole 名（ECS サービス定義で参照）"
  value       = aws_iam_role.ecs_task_execution.name
}
