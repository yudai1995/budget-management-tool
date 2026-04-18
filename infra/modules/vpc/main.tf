# ============================================================
# Module: vpc
#
# 構成:
#   - VPC (10.0.0.0/16)
#   - パブリックサブネット x2 (AZ: a, c) — RDS Multi-AZ 要件を満たす
#   - Internet Gateway
#   - パブリックルートテーブル（0.0.0.0/0 → IGW）
#
# 設計方針:
#   NAT Gateway ($35/月) を不採用。
#   ECS タスクはパブリックサブネットに配置し、
#   ECR/SSM などの AWS サービスには直接インターネット経由でアクセス。
#   RDS へのアクセスは SG で sg-api からのみに制限。
# ============================================================

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.name_prefix}-vpc"
  }
}

# ─── Internet Gateway ────────────────────────────────────────────────────────

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.name_prefix}-igw"
  }
}

# ─── パブリックサブネット（Multi-AZ: a, c）──────────────────────────────────

resource "aws_subnet" "public" {
  for_each = var.public_subnets

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.name_prefix}-pub-${each.key}"
    Tier = "public"
  }
}

# ─── ルートテーブル（IGW 経由で 0.0.0.0/0）─────────────────────────────────

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.name_prefix}-rt-public"
  }
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}
