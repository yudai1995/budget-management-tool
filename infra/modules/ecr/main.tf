# ============================================================
# Module: ecr
#
# 構成:
#   - budget-{name_prefix}-{repo} リポジトリを repositories リストから作成
#   - ライフサイクルポリシー: 最新 max_image_count 世代のみ保持
#     → 無料枠 500MB/月 を超過させないための制限
#
# 禁止事項:
#   - publicly_accessible = true の設定禁止
# ============================================================

resource "aws_ecr_repository" "this" {
  for_each = toset(var.repositories)

  name         = "${var.name_prefix}-${each.key}"
  force_delete = var.force_delete

  image_scanning_configuration {
    # プッシュ時に脆弱性スキャンを自動実行（追加コストなし）
    scan_on_push = true
  }

  # イメージタグの上書きを許可（latest タグの更新に必要）
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_lifecycle_policy" "this" {
  for_each = aws_ecr_repository.this

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "最新 ${var.max_image_count} 世代を保持し、古いイメージを自動削除（無料枠超過防止）"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.max_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
