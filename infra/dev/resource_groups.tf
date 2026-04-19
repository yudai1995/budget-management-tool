# ============================================================
# 環境別リソースグループ
#
# 目的:
#   AWS Resource Groups で「Environment = dev」タグを持つリソースだけを
#   一覧・管理し、dev/prod 間のリソース混入を防ぐ。
#
# prod 環境との分離の仕組み:
#   TagFilters に `Environment = ${var.env}` を指定することで、
#   このグループは同 var.env の値を持つリソースのみを収集する。
#   prod 環境は別の tfvars (env = "prod") から独立した apply で作成されるため、
#   dev グループに prod リソースが混入することは構造的に不可能。
#
# 将来の prod 展開:
#   infra/prod/ ディレクトリを作成し、env = "prod" を指定して apply するだけで
#   prod 専用のリソースグループが自動生成される。
# ============================================================

resource "aws_resourcegroups_group" "env" {
  name        = "${var.project}-${var.env}-group"
  description = "${var.project} ${var.env} environment resource group"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Project"
          Values = [var.project]
        },
        {
          Key    = "Environment"
          Values = [var.env]
        }
      ]
    })
    type = "TAG_FILTERS_1_0"
  }

  tags = {
    Name = "${var.project}-${var.env}-group"
  }
}
