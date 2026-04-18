# ============================================================
# Root Module: dev
#
# フェーズ 1: VPC / IAM / ECR / SG の基盤リソース
# フェーズ 2: ECS クラスター / タスク定義 / サービス
# フェーズ 3: CloudFront ディストリビューション
#
# 適用順:
#   1. cd ../bootstrap && terraform apply  (初回のみ)
#   2. terraform init
#   3. terraform plan
#   4. terraform apply
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
  web_origin_domain = var.initial_web_origin_ip
}
