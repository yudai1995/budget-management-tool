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
#
# CloudFront と IP アドレスの制限:
#   CloudFront のカスタムオリジンは DomainName に IP アドレスを直接指定できない。
#   sslip.io を使って IP を DNS 名に変換する（例: 1.2.3.4.sslip.io → 1.2.3.4）。
#   また、過去の状態で Origin.Id が IP アドレスになっている場合も
#   正規の名前（{name_prefix}-web-origin）に修正する。
# ============================================================

set -euo pipefail

# ─── 引数バリデーション ───────────────────────────────────────────────────────

: "${CLUSTER:?環境変数 CLUSTER が未設定です}"
: "${SERVICE:?環境変数 SERVICE が未設定です}"
: "${CLOUDFRONT_DIST_ID:?環境変数 CLOUDFRONT_DIST_ID が未設定です}"

# ─── ECS タスクの Public IP を取得 ───────────────────────────────────────────

echo "ECS サービス '${SERVICE}' の実行中タスクを取得中..."

# デプロイ直後はタスクが起動中の場合があるためリトライする
TASK_ARN=""
MAX_ATTEMPTS=20
for i in $(seq 1 ${MAX_ATTEMPTS}); do
  TASK_ARN=$(aws ecs list-tasks \
    --cluster "${CLUSTER}" \
    --service-name "${SERVICE}" \
    --desired-status RUNNING \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "")

  if [ -n "${TASK_ARN}" ] && [ "${TASK_ARN}" != "None" ]; then
    echo "タスク ARN: ${TASK_ARN}"
    break
  fi

  if [ "${i}" -lt "${MAX_ATTEMPTS}" ]; then
    echo "実行中タスクなし。15秒後にリトライ... (${i}/${MAX_ATTEMPTS})"
    sleep 15
  fi
done

if [ -z "${TASK_ARN}" ] || [ "${TASK_ARN}" = "None" ]; then
  echo "エラー: ${MAX_ATTEMPTS}回リトライしましたが実行中のタスクが見つかりません" >&2
  echo "ECS サービスの desired_count と最近のイベントを確認してください" >&2
  exit 1
fi

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

# ─── オリジン設定を更新 ────────────────────────────────────────────────────────

# CloudFront は IP アドレスを DomainName に直接指定できないため（InvalidArgument エラー）、
# sslip.io で IP を DNS 名に変換する。
# sslip.io はオープンソースで、x.y.z.w.sslip.io を x.y.z.w に解決する。
ORIGIN_DOMAIN="${PUBLIC_IP}.sslip.io"

# SERVICE 名から name_prefix を導出して期待する Origin ID を構築する
# 例: budget-dev-web → budget-dev → budget-dev-web-origin
NAME_PREFIX="${SERVICE%-web}"
EXPECTED_ORIGIN_ID="${NAME_PREFIX}-web-origin"

# 現在の Origin ID（過去の操作で IP アドレスになっている可能性がある）
CURRENT_ORIGIN_ID=$(echo "${CONFIG}" | jq -r '.Origins.Items[0].Id')
CURRENT_DOMAIN=$(echo "${CONFIG}" | jq -r '.Origins.Items[0].DomainName')

echo ""
echo "現在の Origin:"
echo "  Id         : ${CURRENT_ORIGIN_ID}"
echo "  DomainName : ${CURRENT_DOMAIN}"
echo "更新後の Origin:"
echo "  Id         : ${EXPECTED_ORIGIN_ID}"
echo "  DomainName : ${ORIGIN_DOMAIN}"
echo ""

# DomainName を IP から DNS 名（sslip.io）に変換して更新する。
# Origin.Id が IP アドレスの場合は正規の名前に修正し、
# DefaultCacheBehavior と CacheBehaviors の TargetOriginId も追従させる。
UPDATED_CONFIG=$(echo "${CONFIG}" | jq \
  --arg DOMAIN "${ORIGIN_DOMAIN}" \
  --arg OLD_ID "${CURRENT_ORIGIN_ID}" \
  --arg NEW_ID "${EXPECTED_ORIGIN_ID}" \
  '
    .Origins.Items[0].DomainName = $DOMAIN |
    .Origins.Items[0].Id = $NEW_ID |
    (if .DefaultCacheBehavior.TargetOriginId == $OLD_ID
     then .DefaultCacheBehavior.TargetOriginId = $NEW_ID
     else . end) |
    (if (.CacheBehaviors.Items // []) | length > 0
     then .CacheBehaviors.Items |= map(
       if .TargetOriginId == $OLD_ID then .TargetOriginId = $NEW_ID else . end
     )
     else . end)
  ')

echo "オリジン設定を ${ORIGIN_DOMAIN} に更新中..."

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
echo "完了: CloudFront オリジン → ${ORIGIN_DOMAIN} / Invalidation → ${INVALIDATION_ID}"
