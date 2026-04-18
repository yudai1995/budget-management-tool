#!/usr/bin/env bash
# ============================================================
# update-cloudfront-origin.sh
#
# ECS Fargate タスクに割り当てられた Public IP を取得し、
# CloudFront のオリジン設定を書き換えてキャッシュを無効化する。
#
# 前提:
#   - AWS CLI v2 がインストール・認証済みであること
#   - jq がインストールされていること
#
# 環境変数:
#   CLUSTER             — ECS クラスター名（例: budget-dev-cluster）
#   SERVICE             — ECS サービス名（例: budget-dev-web）
#   CLOUDFRONT_DIST_ID  — CloudFront ディストリビューション ID
# ============================================================

set -euo pipefail

# ─── 引数バリデーション ───────────────────────────────────────────────────────

: "${CLUSTER:?環境変数 CLUSTER が未設定です}"
: "${SERVICE:?環境変数 SERVICE が未設定です}"
: "${CLOUDFRONT_DIST_ID:?環境変数 CLOUDFRONT_DIST_ID が未設定です}"

# ─── ECS タスクの Public IP を取得 ───────────────────────────────────────────

echo "ECS サービス '${SERVICE}' の実行中タスクを取得中..."

TASK_ARN=$(aws ecs list-tasks \
  --cluster "${CLUSTER}" \
  --service-name "${SERVICE}" \
  --desired-status RUNNING \
  --query 'taskArns[0]' \
  --output text)

if [ -z "${TASK_ARN}" ] || [ "${TASK_ARN}" = "None" ]; then
  echo "エラー: 実行中のタスクが見つかりません" >&2
  exit 1
fi

echo "タスク ARN: ${TASK_ARN}"

# タスクの ENI ID を取得
ENI_ID=$(aws ecs describe-tasks \
  --cluster "${CLUSTER}" \
  --tasks "${TASK_ARN}" \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

if [ -z "${ENI_ID}" ] || [ "${ENI_ID}" = "None" ]; then
  echo "エラー: ENI ID を取得できませんでした" >&2
  exit 1
fi

echo "ENI ID: ${ENI_ID}"

# ENI から Public IP を取得
PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids "${ENI_ID}" \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text)

if [ -z "${PUBLIC_IP}" ] || [ "${PUBLIC_IP}" = "None" ]; then
  echo "エラー: Public IP を取得できませんでした" >&2
  exit 1
fi

echo "取得した Public IP: ${PUBLIC_IP}"

# ─── CloudFront ディストリビューション設定を取得 ──────────────────────────────

echo "CloudFront ディストリビューション '${CLOUDFRONT_DIST_ID}' の設定を取得中..."

DIST_CONFIG=$(aws cloudfront get-distribution-config \
  --id "${CLOUDFRONT_DIST_ID}")

ETAG=$(echo "${DIST_CONFIG}" | jq -r '.ETag')
CONFIG=$(echo "${DIST_CONFIG}" | jq '.DistributionConfig')

echo "現在の ETag: ${ETAG}"

# ─── オリジンドメインを新しい Public IP に書き換え ────────────────────────────

UPDATED_CONFIG=$(echo "${CONFIG}" | jq \
  --arg IP "${PUBLIC_IP}" \
  '.Origins.Items[0].DomainName = $IP')

echo "オリジン設定を ${PUBLIC_IP} に更新中..."

aws cloudfront update-distribution \
  --id "${CLOUDFRONT_DIST_ID}" \
  --distribution-config "${UPDATED_CONFIG}" \
  --if-match "${ETAG}" \
  --output text > /dev/null

echo "CloudFront オリジン更新完了"

# ─── キャッシュ無効化（Invalidation） ────────────────────────────────────────

echo "CloudFront キャッシュを無効化中..."

INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "${CLOUDFRONT_DIST_ID}" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "Invalidation ID: ${INVALIDATION_ID}"
echo "キャッシュ無効化リクエストを送信しました（完了まで数分かかる場合があります）"
echo "完了: CloudFront オリジン → ${PUBLIC_IP} / Invalidation → ${INVALIDATION_ID}"
