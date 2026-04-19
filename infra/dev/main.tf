# ============================================================
# Root Module: dev
#
# フェーズ 1: VPC / IAM / ECR / SG の基盤リソース
# フェーズ 2: ECS クラスター / タスク定義 / サービス
# フェーズ 3: CloudFront ディストリビューション（Origin Shield 付き）
# フェーズ 4: 監視（CloudWatch Alarm + SNS + Budget 予測アラート）
# フェーズ 5: RDS MySQL（SSM 自動同期）
#
# 適用順:
#   1. cd ../bootstrap && terraform apply  (初回のみ)
#   2. SSM に CF_ORIGIN_SECRET を事前登録: aws ssm put-parameter ...
#   3. terraform init && terraform plan && terraform apply
# ============================================================

# ─── フェーズ 1: VPC ─────────────────────────────────────────────────────────

module "vpc" {
  source      = "../modules/vpc"
  name_prefix = local.name_prefix
}

# ─── フェーズ 2: IAM (OIDC + Roles) ──────────────────────────────────────────

module "iam" {
  source      = "../modules/iam"
  name_prefix = local.name_prefix
  aws_region  = var.aws_region
  github_org  = var.github_org
  github_repo = var.github_repo
  ssm_prefix  = var.ssm_prefix
}

# ─── フェーズ 3: ECR リポジトリ ───────────────────────────────────────────────

module "ecr" {
  source      = "../modules/ecr"
  name_prefix = local.name_prefix
}

# ─── フェーズ 4: セキュリティグループ ────────────────────────────────────────

module "sg" {
  source      = "../modules/sg"
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = module.vpc.vpc_cidr
}

# ─── フェーズ 5: ECS クラスター・タスク定義・サービス ──────────────────────────

module "ecs" {
  source      = "../modules/ecs"
  name_prefix = local.name_prefix
  aws_region  = var.aws_region
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids

  web_sg_id               = module.sg.web_sg_id
  api_sg_id               = module.sg.api_sg_id
  task_execution_role_arn = module.iam.ecs_task_execution_role_arn

  # 初期イメージは ECR にプッシュ後に更新（初回は placeholder）
  web_image = "${module.ecr.repository_urls["web"]}:latest"
  api_image = "${module.ecr.repository_urls["api"]}:latest"

  ssm_prefix = var.ssm_prefix
}

# ─── フェーズ 6: CloudFront ディストリビューション ───────────────────────────

module "cloudfront" {
  source      = "../modules/cloudfront"
  name_prefix = local.name_prefix

  # ECS タスク起動後に scripts/update-cloudfront-origin.sh で自動更新
  # 初回 apply 時は placeholder（terraform apply 後に手動で初回デプロイを実行）
  web_origin_domain = var.initial_web_origin_domain

  # Layer 2: Origin Shield — CloudFront がこのシークレットをカスタムヘッダーで送出
  # SSM に事前登録: aws ssm put-parameter --name /budget/dev/cf_origin_secret --type SecureString --value <ランダム文字列>
  origin_shield_secret_ssm_path = "${var.ssm_prefix}/cf_origin_secret"
}

# ─── フェーズ 7: 監視（CloudWatch + SNS + Budget 予測アラート） ──────────────

module "monitoring" {
  source      = "../modules/monitoring"
  name_prefix = local.name_prefix
  alert_email = var.alert_email

  ecs_cluster_name     = module.ecs.cluster_name
  ecs_api_service_name = module.ecs.api_service_name
  budget_limit_usd     = var.budget_limit_usd

  # ECS module が CloudWatch Log Group を作成するまで待機
  depends_on = [module.ecs]
}

# ─── フェーズ 8: RDS MySQL ────────────────────────────────────────────────────

module "rds" {
  source      = "../modules/rds"
  name_prefix = local.name_prefix
  aws_region  = var.aws_region

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  api_sg_id  = module.sg.api_sg_id
  ssm_prefix = var.ssm_prefix

  db_name     = var.db_name
  db_username = var.db_username
}
