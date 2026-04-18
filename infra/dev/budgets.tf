# ============================================================
# AWS Budgets: 月次コスト上限アラート
#
# 無料枠: AWS Budgets は月 2 件まで無料
# アラート条件: 実績が上限の 80% / 100% を超えた場合にメール送信
# ============================================================

resource "aws_budgets_budget" "monthly" {
  name         = "${local.name_prefix}-monthly-budget"
  budget_type  = "COST"
  limit_amount = var.budget_limit_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # 実績コストが上限の 80% を超えたらアラート
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  # 実績コストが上限の 100% を超えたらアラート
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}
