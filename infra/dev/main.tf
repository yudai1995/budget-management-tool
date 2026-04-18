# ============================================================
# Root Module: dev
#
# フェーズ 1: VPC / IAM / ECR / SG の基盤リソース
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
