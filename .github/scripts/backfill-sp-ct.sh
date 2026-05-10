#!/usr/bin/env bash
# backfill-sp-ct.sh
#
# velocity-log.json の履歴データを使い、プロジェクトボードの
# 「Story Points」「Cycle Time (h)」「Sprint #」フィールドを一括更新する。
#
# 使い方:
#   PROJECT_TOKEN=<PAT> bash .github/scripts/backfill-sp-ct.sh
#   ※ PROJECT_TOKEN は read:project + write:project 権限を持つ PAT

set -euo pipefail

TOKEN="${PROJECT_TOKEN:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "エラー: PROJECT_TOKEN または GH_TOKEN が必要です。"
  exit 1
fi

PROJECT_ID="PVT_kwHOA-qlQM4BWtuo"
# フィールド ID（measure-cycle-time.yml と同じ値）
SPRINT_NUM_FIELD="PVTF_lAHOA-qlQM4BWtuozhSdS10"
SP_FIELD="PVTF_lAHOA-qlQM4BWtuozhSdS2Q"
CT_FIELD="PVTF_lAHOA-qlQM4BWtuozhSdS2U"

echo "velocity-log.json からスプリントデータを読み込み中..."

export TOKEN

python3 <<PYEOF
import json, subprocess, os

token = os.environ.get("TOKEN", "")
if not token:
    raise SystemExit("エラー: TOKEN 環境変数が空です")

project_id = "$PROJECT_ID"

with open(".github/velocity-log.json") as f:
    log = json.load(f)

sprints = log.get("sprints", [])
print(f"スプリント数: {len(sprints)}")

# Issue → (sprint_number, points, cycle_time) のマッピングを構築
issue_map: dict[int, dict] = {}
for sprint in sprints:
    sprint_num = sprint.get("sprint_number")
    for pbi in sprint.get("pbis", []):
        issue_num = pbi.get("issue")
        if issue_num:
            issue_map[issue_num] = {
                "sprint_number": sprint_num,
                "points": pbi.get("points"),
                "cycle_time_hours": pbi.get("cycle_time_hours"),
            }

print(f"マッピング件数: {len(issue_map)}")

# プロジェクトアイテム一覧を取得
query = """
{
  user(login: "yyamamoto95") {
    projectV2(number: 1) {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue { number }
          }
          fieldValues(first: 15) {
            nodes {
              ... on ProjectV2ItemFieldNumberValue {
                number
                field { ... on ProjectV2Field { id name } }
              }
            }
          }
        }
      }
    }
  }
}
"""

result = subprocess.run(
    ["gh", "api", "graphql", "-f", f"query={query}"],
    capture_output=True, text=True, env={**os.environ, "GH_TOKEN": token}
)
data = json.loads(result.stdout)
nodes = data["data"]["user"]["projectV2"]["items"]["nodes"]

updated = 0
skipped = 0

for node in nodes:
    content = node.get("content", {})
    issue_num = content.get("number")
    if not issue_num or issue_num not in issue_map:
        skipped += 1
        continue

    info = issue_map[issue_num]
    item_id = node["id"]

    # 既存フィールド値を確認（上書き不要なら skip）
    existing = {}
    for fv in node.get("fieldValues", {}).get("nodes", []):
        fname = fv.get("field", {}).get("name", "")
        if fname in ("Sprint #", "Story Points", "Cycle Time (h)"):
            existing[fname] = fv.get("number")

    def update_number_field(field_id: str, value):
        if value is None:
            return
        mutation = f"""
mutation {{
  updateProjectV2ItemFieldValue(input: {{
    projectId: "{project_id}"
    itemId: "{item_id}"
    fieldId: "{field_id}"
    value: {{ number: {value} }}
  }}) {{ projectV2Item {{ id }} }}
}}
"""
        subprocess.run(
            ["gh", "api", "graphql", "-f", f"query={mutation}"],
            capture_output=True, text=True, env={**os.environ, "GH_TOKEN": token}
        )

    update_number_field("$SPRINT_NUM_FIELD", info["sprint_number"])
    update_number_field("$SP_FIELD", info["points"])
    update_number_field("$CT_FIELD", info["cycle_time_hours"])

    print(f"  #{issue_num}: Sprint#{info['sprint_number']}, {info['points']}pt, {info['cycle_time_hours']}h")
    updated += 1

print(f"\n完了: {updated} 件更新, {skipped} 件スキップ")
PYEOF
