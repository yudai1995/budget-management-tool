# ============================================================
# Module: ecs
#
# 構成:
#   1. ECS クラスター（Fargate、Container Insights 無効で無料枠維持）
#   2. CloudWatch ロググループ（web / api 各サービス用）
#   3. ECS タスク定義（web / api）
#      - 0.25 vCPU / 512MB（無料枠 750h/月）
#      - 環境変数は SSM Parameter Store から注入（ハードコード禁止）
#   4. ECS サービス（web / api）
#      - Fargate、パブリックサブネット直接配置（NAT GW 不要）
#      - desired_count = 1（停止時は 0 に変更して無料枠節約可）
#
# 禁止事項:
#   - タスク定義への DATABASE_URL 等の直書き
#   - ALB / NAT Gateway の使用
# ============================================================

# ─── ECS クラスター ───────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    # Container Insights は有料のため無効化
    name  = "containerInsights"
    value = "disabled"
  }
}

# ─── CloudWatch ロググループ ──────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${var.name_prefix}/web"
  retention_in_days = 7 # 無料枠 5GB/月 を超えないよう短期保持
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.name_prefix}/api"
  retention_in_days = 7
}

# ─── タスク定義: web ─────────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "web" {
  family                   = "${var.name_prefix}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_execution_role_arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = var.web_image
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        # API_URL は VPC 内部の api タスク IP を指定（デプロイ後に更新）
        # 初期値は placeholder。ECS Service Connect または手動更新で解決
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]

      # SSM から環境変数を注入（ハードコード禁止）
      secrets = [
        {
          name      = "NEXT_PUBLIC_API_URL"
          valueFrom = "${var.ssm_prefix}/api_url"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.web.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:3000/ || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# ─── タスク定義: api ─────────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.name_prefix}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_execution_role_arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.api_image
      essential = true

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3001"
        }
      ]

      # SSM から DATABASE_URL 等のシークレットを注入（ハードコード禁止）
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${var.ssm_prefix}/database_url"
        },
        {
          name      = "JWT_SECRET"
          valueFrom = "${var.ssm_prefix}/jwt_secret"
        },
        # Layer 2: Origin Shield 検証用シークレット
        # CloudFront が X-CF-Origin-Secret ヘッダーで送出する値と一致した場合のみリクエストを通過させる
        {
          name      = "CF_ORIGIN_SECRET"
          valueFrom = "${var.ssm_prefix}/cf_origin_secret"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:3001/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# ─── ECS サービス: web ───────────────────────────────────────────────────────

resource "aws_ecs_service" "web" {
  name            = "${var.name_prefix}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.web_sg_id]
    # NAT GW なしで ECR / SSM へアクセスするためパブリック IP を付与
    assign_public_ip = true
  }

  # タスク定義の変更はデプロイパイプラインが管理するため、Terraform では無視
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

# ─── ECS サービス: api ───────────────────────────────────────────────────────

resource "aws_ecs_service" "api" {
  name            = "${var.name_prefix}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.api_sg_id]
    assign_public_ip = true
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}
