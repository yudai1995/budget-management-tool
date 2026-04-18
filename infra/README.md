# infra — Terraform による AWS インフラ構成

budget-management-tool の AWS インフラを Terraform で管理するディレクトリ。

## ディレクトリ構成

```
infra/
├── bootstrap/          # 前提リソース（S3 state バケット・DynamoDB ロックテーブル）
├── modules/            # 再利用可能なモジュール
│   ├── vpc/            # VPC・サブネット・ルートテーブル
│   ├── iam/            # OIDC プロバイダー・IAM ロール
│   ├── ecr/            # ECR リポジトリ・ライフサイクルポリシー
│   └── sg/             # セキュリティグループ（web/api/rds）
└── dev/                # dev 環境のルートモジュール
```

## 設計方針（コスト最小化）

| 非採用リソース | 理由 |
|--------------|------|
| ALB | CloudFront + Next.js Rewrites で代替（月 $16 削減） |
| NAT Gateway | パブリックサブネット構成で代替（月 $35 削減） |
| Secrets Manager | SSM Parameter Store 無料枠で代替（月 $0.4/secret 削減） |

- Fargate: 0.25 vCPU / 512MB（無料枠 750h/月 に収める）
- ECR: ライフサイクルポリシーで最新 5 世代のみ保持（無料枠 500MB/月 以内）
- AWS Budgets: 月 $1 超過時にアラートメール送信

## 認証方式

GitHub Actions から AWS への認証は **OIDC（キーレス認証）** を採用。永続的なアクセスキーは発行しない。

```
GitHub Actions → OIDC トークン → AssumeRoleWithWebIdentity → GitHubActionsRole
```

`main` ブランチからの push のみが AssumeRole を許可される（他ブランチは拒否）。

## セキュリティ構成

| ファイル | Git 管理 | 理由 |
|---------|---------|------|
| `*.tfvars` | **除外** | メールアドレス・GitHub ユーザー名等を含むため |
| `*.tfstate` | **除外** | AWS リソース ID 等の実行時情報を含むため |
| `.terraform.lock.hcl` | **追跡** | プロバイダーバージョンの再現性確保のため |
| `*.tfvars.example` | **追跡** | 設定項目のテンプレートとして共有 |

## 初回セットアップ手順

### 前提条件

- Terraform >= 1.7.0
- AWS CLI（`aws configure` 済み、または環境変数で認証設定済み）

### Step 1: Terraform state バックエンドの作成

```bash
cd infra/bootstrap
terraform init
terraform apply
```

S3 バケット `budget-dev-terraform-state` と DynamoDB テーブル `budget-dev-terraform-locks` が作成される。

### Step 2: tfvars の準備

```bash
cd infra/dev
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して実際の値を入力する
```

### Step 3: dev 環境の適用

```bash
cd infra/dev
terraform init
terraform plan   # 差分を確認してから
terraform apply
```

### Step 4: GitHub Actions の設定

`terraform apply` 完了後に出力される値を GitHub リポジトリの Secrets に登録する。

| Secrets 名 | terraform output | 説明 |
|-----------|-----------------|------|
| `AWS_ROLE_ARN` | `github_actions_role_arn` | OIDC で assume するロール ARN |
| `AWS_REGION` | — | `ap-northeast-1` を直接入力 |

ECR push 先 URL は `ecr_repository_urls` output を参照。

## 変更時の注意

- `terraform plan` で差分を必ず確認してから `apply` する
- RDS の `publicly_accessible = true` は禁止（セキュリティポリシー）
- `aws_nat_gateway` / `aws_alb` の追加はコスト審査が必要
- IAM ポリシーの拡張は最小権限原則に従い、追加理由をコメントに記載する
