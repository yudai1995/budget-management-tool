output "cluster_name" {
  description = "ECS クラスター名（GitHub Actions Secrets の ECS_CLUSTER に設定）"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ECS クラスター ARN"
  value       = aws_ecs_cluster.main.arn
}

output "web_service_name" {
  description = "ECS web サービス名（GitHub Actions Secrets の ECS_SERVICE_WEB に設定）"
  value       = aws_ecs_service.web.name
}

output "api_service_name" {
  description = "ECS api サービス名（GitHub Actions Secrets の ECS_SERVICE_API に設定）"
  value       = aws_ecs_service.api.name
}

output "web_task_family" {
  description = "web タスク定義ファミリー名（GitHub Actions Secrets の ECS_TASK_FAMILY_WEB に設定）"
  value       = aws_ecs_task_definition.web.family
}

output "api_task_family" {
  description = "api タスク定義ファミリー名（GitHub Actions Secrets の ECS_TASK_FAMILY_API に設定）"
  value       = aws_ecs_task_definition.api.family
}
