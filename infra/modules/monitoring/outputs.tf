output "sns_topic_arn" {
  description = "アラート送信先 SNS トピック ARN"
  value       = aws_sns_topic.alerts.arn
}

output "api_error_alarm_name" {
  description = "API エラー急増 CloudWatch アラーム名"
  value       = aws_cloudwatch_metric_alarm.api_error_logs_spike.alarm_name
}
