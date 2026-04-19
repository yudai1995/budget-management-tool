# ============================================================
# Module: sg
#
# 構成:
#   1. sg-web  — CloudFront/インターネットからの HTTP/HTTPS を受け付ける
#   2. sg-api  — sg-web からのトラフィックのみを受け付ける
#   3. sg-rds  — sg-api からの MySQL (3306) のみを受け付ける
#
# 禁止事項:
#   - sg-rds への 0.0.0.0/0 ingress は絶対に設定しない
# ============================================================

# ─── sg-web ──────────────────────────────────────────────────────────────────

resource "aws_security_group" "web" {
  name        = "${var.name_prefix}-sg-web"
  description = "CloudFront and Internet to ECS Web (80, 443)"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-sg-web"
  }
}

# ─── sg-api ──────────────────────────────────────────────────────────────────

resource "aws_security_group" "api" {
  name        = "${var.name_prefix}-sg-api"
  description = "ECS Web to ECS API (3000)"
  vpc_id      = var.vpc_id

  ingress {
    description     = "API port from sg-web"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-sg-api"
  }
}

# ─── sg-rds ──────────────────────────────────────────────────────────────────

resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-sg-rds"
  description = "ECS API to RDS MySQL (3306) only. Direct access from outside is denied."
  vpc_id      = var.vpc_id

  ingress {
    description     = "MySQL from sg-api only"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  # egress はデフォルトで全拒否（RDS から外部への通信は不要）
  # 明示的に egress を定義しないことで AWS のデフォルト動作（全許可）を避ける
  egress {
    description = "Allow all outbound within VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = {
    Name = "${var.name_prefix}-sg-rds"
  }
}
