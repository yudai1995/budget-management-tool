#!/bin/bash

# --- プロジェクト憲法遵守チェックスクリプト ---

# 1. ブランチチェック
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" == "main" ]; then
  echo "【警告】現在 main ブランチにいます。"
  echo "必須プロセスに従い、/branch スキルで作業ブランチを作成してください。"
  exit 1
fi

# 2. 調査プロセスの確認
# AIエージェントが自律的に動く際、この入力を求めることで「思考の強制」を行います
echo "【確認】/search による影響調査（grep等）は完了していますか？ (y/n)"
read -r response
if [ "$response" != "y" ]; then
  echo "調査プロセスをスキップすることはできません。/search を実行してください。"
  exit 1
fi

echo "✅ 必須プロセスのチェックを通過しました。実装を開始してください。"

### 導入方法
1. `.claude/enforce-skills.sh` として保存。
2. 実行権限を付与：`chmod +x .claude/enforce-skills.sh`
3. `.claude/settings.json` の `hooks` 内で、このスクリプトを呼び出すように設定すると、より厳格な運用が可能になります。

```json
{
  "hooks": {
    "on_user_message": "./.claude/enforce-skills.sh && 必須プロセスを順守せよ..."
  }
}

これで、Claude Code が物理的なスクリプトによって「待て」をかけられる状態になります。
