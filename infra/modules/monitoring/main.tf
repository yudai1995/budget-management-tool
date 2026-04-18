# ============================================================
# Module: monitoring
#
# 構成:
#   1. SNS トピック + メール購読（アラート送信先）
#   2. CloudWatch Metric Alarm — API 5xx エラー急増検知
#   3. AWS Budgets — 月次実績 80%/100% アラート + 予測超過アラート
# ============================================================

# ─── SNS トピック ─────────────────────────────────────────────────────────────

resource "aws_sns_topic" "alerts" {
  name = "${var.name_prefix}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ─── CloudWatch: API 5xx エラー急増アラーム ────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "api_5xx_spike" {
  alarm_name          = "${var.name_prefix}-api-5xx-spike"
  alarm_description   = "API サービスの 5xx エラーが ${var.api_5xx_threshold} 件/5分 を超過した"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.api_5xx_threshold
  treat_missing_data  = "notBreaching"

  # ECS サービスレベルの 5xx を監視
  # ALB レス構成のため ECS サービスメトリクスを使用
  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_api_service_name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# ECS タスクレベルの監視（ALB なし構成では CloudWatch Container Insights のカスタムメトリクスが必要）
# Container Insights は有料のため、CloudWatch Logs の ERROR ログをフィルタリングする方式を採用
resource "aws_cloudwatch_log_metric_filter" "api_5xx" {
  name           = "${var.name_prefix}-api-5xx-errors"
  log_group_name = "/ecs/${var.name_prefix}/api"
  pattern        = "[timestamp, requestId, level=\"ERROR\", ...]"

  metric_transformation {
    name          = "${var.name_prefix}-api-errors"
    namespace     = "${var.name_prefix}/API"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_error_logs_spike" {
  alarm_name          = "${var.name_prefix}-api-error-logs-spike"
  alarm_description   = "API の ERROR ログが ${var.api_5xx_threshold} 件/5分 を超過した"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "${var.name_prefix}-api-errors"
  namespace           = "${var.name_prefix}/API"
  period              = 300
  statistic           = "Sum"
  threshold           = var.api_5xx_threshold
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# ─── AWS Budgets: 月次コスト監視（実績 + 予測） ───────────────────────────────

resource "aws_budgets_budget" "monthly_with_forecast" {
  name         = "${var.name_prefix}-monthly-budget-forecast"
  budget_type  = "COST"
  limit_amount = var.budget_limit_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # 実績が 80% 超: 早期警告
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  # 実績が 100% 超: 超過通知
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  # 予測が 100% 超: 月末超過が見込まれる段階で事前通知
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }
}
